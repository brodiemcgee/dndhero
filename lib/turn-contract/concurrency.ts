/**
 * Optimistic Concurrency Control
 * Uses state_version to prevent race conditions and conflicting updates
 */

export interface VersionedEntity {
  id: string
  state_version: number
}

export interface ConcurrencyError {
  type: 'version_mismatch' | 'entity_not_found' | 'entity_locked'
  message: string
  expectedVersion?: number
  actualVersion?: number
}

export interface UpdateResult<T> {
  success: boolean
  data?: T
  error?: ConcurrencyError
  retryable: boolean
}

/**
 * Check if version matches expected
 */
export function validateVersion(
  entity: VersionedEntity,
  expectedVersion: number
): { valid: boolean; error?: ConcurrencyError } {
  if (entity.state_version !== expectedVersion) {
    return {
      valid: false,
      error: {
        type: 'version_mismatch',
        message: `Version mismatch: expected ${expectedVersion}, found ${entity.state_version}`,
        expectedVersion,
        actualVersion: entity.state_version,
      },
    }
  }

  return { valid: true }
}

/**
 * Create update with optimistic concurrency check
 */
export function createOptimisticUpdate<T extends Record<string, any>>(
  currentVersion: number,
  updates: Partial<T>
): T & { state_version: number } {
  return {
    ...updates,
    state_version: currentVersion + 1,
  } as T & { state_version: number }
}

/**
 * Handle concurrent update attempt
 */
export async function handleConcurrentUpdate<T extends VersionedEntity, R>(
  entityId: string,
  expectedVersion: number,
  updateFn: (entity: T) => Promise<R>,
  fetchEntity: (id: string) => Promise<T | null>,
  maxRetries: number = 3
): Promise<UpdateResult<R>> {
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      // Fetch current entity
      const entity = await fetchEntity(entityId)

      if (!entity) {
        return {
          success: false,
          error: {
            type: 'entity_not_found',
            message: `Entity ${entityId} not found`,
          },
          retryable: false,
        }
      }

      // Validate version
      const validation = validateVersion(entity, expectedVersion)

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          retryable: true,
        }
      }

      // Perform update
      const result = await updateFn(entity)

      return {
        success: true,
        data: result,
        retryable: false,
      }
    } catch (error) {
      attempt++

      if (attempt >= maxRetries) {
        return {
          success: false,
          error: {
            type: 'entity_locked',
            message: `Failed to update entity after ${maxRetries} attempts`,
          },
          retryable: false,
        }
      }

      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 100)
    }
  }

  return {
    success: false,
    error: {
      type: 'entity_locked',
      message: 'Maximum retries exceeded',
    },
    retryable: false,
  }
}

/**
 * Compare-and-swap pattern for atomic updates
 */
export interface CompareAndSwapParams<T> {
  entityId: string
  expectedVersion: number
  updates: Partial<T>
  fetchEntity: (id: string) => Promise<(T & VersionedEntity) | null>
  applyUpdate: (id: string, updates: Partial<T> & { state_version: number }) => Promise<T>
}

export async function compareAndSwap<T extends Record<string, any>>({
  entityId,
  expectedVersion,
  updates,
  fetchEntity,
  applyUpdate,
}: CompareAndSwapParams<T>): Promise<UpdateResult<T>> {
  try {
    // Fetch current state
    const current = await fetchEntity(entityId)

    if (!current) {
      return {
        success: false,
        error: {
          type: 'entity_not_found',
          message: `Entity ${entityId} not found`,
        },
        retryable: false,
      }
    }

    // Validate version
    const validation = validateVersion(current, expectedVersion)

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        retryable: true,
      }
    }

    // Apply update with incremented version
    const optimisticUpdates = createOptimisticUpdate(expectedVersion, updates)
    const result = await applyUpdate(entityId, optimisticUpdates)

    return {
      success: true,
      data: result,
      retryable: false,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'entity_locked',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      retryable: true,
    }
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<UpdateResult<T>>,
  maxRetries: number = 3,
  baseDelayMs: number = 100
): Promise<UpdateResult<T>> {
  let attempt = 0
  let lastResult: UpdateResult<T> | null = null

  while (attempt < maxRetries) {
    lastResult = await operation()

    if (lastResult.success || !lastResult.retryable) {
      return lastResult
    }

    attempt++

    if (attempt < maxRetries) {
      // Exponential backoff with jitter
      const delay = Math.pow(2, attempt) * baseDelayMs
      const jitter = Math.random() * baseDelayMs
      await sleep(delay + jitter)
    }
  }

  return (
    lastResult || {
      success: false,
      error: {
        type: 'entity_locked',
        message: 'Operation failed without result',
      },
      retryable: false,
    }
  )
}

/**
 * Lock-free queue for sequential updates
 */
export class UpdateQueue<T extends VersionedEntity> {
  private queue: Array<{
    id: string
    operation: (entity: T) => Promise<T>
    resolve: (result: UpdateResult<T>) => void
  }> = []
  private processing = new Set<string>()

  async enqueue(
    entityId: string,
    operation: (entity: T) => Promise<T>
  ): Promise<UpdateResult<T>> {
    return new Promise((resolve) => {
      this.queue.push({ id: entityId, operation, resolve })
      this.process()
    })
  }

  private async process() {
    const next = this.queue.find((item) => !this.processing.has(item.id))

    if (!next) {
      return
    }

    this.processing.add(next.id)

    try {
      // Process the operation
      // This is a simplified version - real implementation would fetch entity and validate
      const result: UpdateResult<T> = {
        success: true,
        retryable: false,
      }

      next.resolve(result)
    } catch (error) {
      next.resolve({
        success: false,
        error: {
          type: 'entity_locked',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        retryable: true,
      })
    } finally {
      this.processing.delete(next.id)
      this.queue = this.queue.filter((item) => item.id !== next.id)

      // Process next item
      if (this.queue.length > 0) {
        this.process()
      }
    }
  }
}

/**
 * Detect concurrent modifications
 */
export function detectConcurrentModification(
  expectedVersion: number,
  actualVersion: number
): boolean {
  return expectedVersion !== actualVersion
}

/**
 * Calculate version drift
 */
export function getVersionDrift(expectedVersion: number, actualVersion: number): number {
  return Math.abs(actualVersion - expectedVersion)
}

/**
 * Check if entity is stale
 */
export function isStale(
  expectedVersion: number,
  actualVersion: number,
  maxDrift: number = 1
): boolean {
  return getVersionDrift(expectedVersion, actualVersion) > maxDrift
}

/**
 * Generate conflict resolution message
 */
export function getConflictMessage(error: ConcurrencyError): string {
  switch (error.type) {
    case 'version_mismatch':
      return `The turn state has been updated by another process. Expected version ${error.expectedVersion}, but found ${error.actualVersion}. Please refresh and try again.`

    case 'entity_not_found':
      return 'The turn contract could not be found. It may have been deleted or completed.'

    case 'entity_locked':
      return 'The turn is currently being updated. Please try again in a moment.'

    default:
      return 'An unknown concurrency error occurred.'
  }
}

/**
 * Sleep utility for backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Merge updates with conflict detection
 */
export function mergeUpdates<T extends Record<string, any>>(
  base: T,
  ours: Partial<T>,
  theirs: Partial<T>
): { merged: T; conflicts: string[] } {
  const merged = { ...base }
  const conflicts: string[] = []

  // Get all keys that were modified
  const allKeys = new Set([...Object.keys(ours), ...Object.keys(theirs)])

  for (const key of allKeys) {
    const ourValue = ours[key as keyof T]
    const theirValue = theirs[key as keyof T]
    const baseValue = base[key as keyof T]

    // Both modified the same field
    if (ourValue !== undefined && theirValue !== undefined) {
      if (ourValue !== theirValue) {
        conflicts.push(key)
        // Prefer their value (last write wins)
        merged[key as keyof T] = theirValue
      } else {
        merged[key as keyof T] = ourValue
      }
    }
    // Only we modified
    else if (ourValue !== undefined) {
      merged[key as keyof T] = ourValue
    }
    // Only they modified
    else if (theirValue !== undefined) {
      merged[key as keyof T] = theirValue
    }
  }

  return { merged, conflicts }
}
