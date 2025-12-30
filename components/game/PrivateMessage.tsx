'use client'

import { CommandResult, TableData, PrivateMessage as PrivateMessageType, CommandAction } from '@/lib/commands/types'

interface PrivateMessageProps {
  message: PrivateMessageType
  onAction?: (command: string) => void
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Render markdown-like content (basic bold support)
 */
function renderContent(text: string): JSX.Element[] {
  // Split by ** for bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-purple-300">
          {part.slice(2, -2)}
        </strong>
      )
    }
    // Handle backticks for code
    if (part.includes('`')) {
      const codeParts = part.split(/(`[^`]+`)/g)
      return (
        <span key={i}>
          {codeParts.map((codePart, j) => {
            if (codePart.startsWith('`') && codePart.endsWith('`')) {
              return (
                <code key={j} className="bg-gray-700 px-1 rounded text-purple-200">
                  {codePart.slice(1, -1)}
                </code>
              )
            }
            return codePart
          })}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

/**
 * Render table data
 */
function renderTable(data: TableData): JSX.Element {
  return (
    <table className="w-full text-sm mt-2">
      <thead>
        <tr className="border-b border-gray-600">
          {data.headers.map((header, i) => (
            <th
              key={i}
              className="text-left py-1 px-2 text-purple-300 font-semibold"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-700/50">
            {row.map((cell, j) => (
              <td key={j} className="py-1 px-2 text-gray-300">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Render list items
 */
function renderList(items: string[]): JSX.Element {
  return (
    <ul className="space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="text-gray-300 text-sm pl-2">
          {renderContent(item)}
        </li>
      ))}
    </ul>
  )
}

/**
 * Render the result content based on type
 */
function renderResult(result: CommandResult): JSX.Element {
  switch (result.type) {
    case 'table':
      return (
        <>
          {result.metadata?.summary && (
            <div className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">
              {renderContent(result.metadata.summary as string)}
            </div>
          )}
          {renderTable(result.content as TableData)}
        </>
      )

    case 'list':
      return renderList(result.content as string[])

    case 'error':
      return (
        <div className="text-red-400 text-sm">
          {result.content as string}
        </div>
      )

    case 'text':
    default:
      return (
        <div className="text-gray-300 text-sm whitespace-pre-wrap">
          {(result.content as string).split('\n').map((line, i) => (
            <div key={i}>{renderContent(line)}</div>
          ))}
        </div>
      )
  }
}

/**
 * Render action buttons
 */
function renderActions(
  actions: CommandAction[],
  onAction?: (command: string) => void
): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-purple-800/50">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction?.(action.command)}
          className="px-2.5 py-1 text-xs font-medium bg-purple-800/50 hover:bg-purple-700/60
                     text-purple-200 rounded transition-colors border border-purple-700/50"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Private message component for command responses
 * Styled distinctly from regular chat messages
 */
export function PrivateMessage({ message, onAction }: PrivateMessageProps) {
  const { result, created_at } = message

  return (
    <div className="p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-400 text-xs font-bold px-1.5 py-0.5 bg-purple-900/50 rounded">
          Private
        </span>
        {result.title && (
          <span className="text-purple-300 text-sm font-semibold">
            {result.title}
          </span>
        )}
        <span className="text-gray-500 text-xs ml-auto">
          {formatTime(created_at)}
        </span>
      </div>

      {/* Content */}
      {renderResult(result)}

      {/* Action buttons */}
      {result.actions && result.actions.length > 0 && renderActions(result.actions, onAction)}
    </div>
  )
}

export default PrivateMessage
