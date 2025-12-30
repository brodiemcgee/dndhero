'use client'

import { useMemo } from 'react'
import { useRulesWiki } from './RulesWikiContext'
import { getRulesBySubcategory, getRuleById, getSubcategoryInfo } from '@/data/rules'
import type { RuleEntry, RuleTable, RuleExample } from '@/types/rules'

export function RulesWikiContent() {
  const { currentPath, navigateTo } = useRulesWiki()

  // Parse path to get category/subcategory and optional rule ID
  const { category, subcategory } = useMemo(() => {
    const parts = currentPath.split('/')
    const [category, subcategoryWithHash] = parts
    const [subcategory] = subcategoryWithHash?.split('#') || []
    return { category, subcategory }
  }, [currentPath])

  // Get rules for this subcategory
  const rules = useMemo(() => {
    if (!category || !subcategory) return []
    return getRulesBySubcategory(category, subcategory)
  }, [category, subcategory])

  // Get subcategory info for the header
  const subcategoryInfo = useMemo(() => {
    if (!category || !subcategory) return null
    return getSubcategoryInfo(category, subcategory)
  }, [category, subcategory])

  if (rules.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No content found for this topic.</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded text-sm transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Subcategory Header */}
      {subcategoryInfo && (
        <div className="mb-6">
          <h2 className="font-['Press_Start_2P'] text-base text-amber-400">
            {subcategoryInfo.subcategory.name}
          </h2>
          {subcategoryInfo.subcategory.description && (
            <p className="text-gray-400 text-sm mt-2">{subcategoryInfo.subcategory.description}</p>
          )}
        </div>
      )}

      {/* Rules List */}
      {rules.map((rule, index) => (
        <RuleCard key={rule.id} rule={rule} isFirst={index === 0} navigateTo={navigateTo} />
      ))}
    </div>
  )
}

interface RuleCardProps {
  rule: RuleEntry
  isFirst: boolean
  navigateTo: (path: string) => void
}

function RuleCard({ rule, isFirst, navigateTo }: RuleCardProps) {
  return (
    <article id={rule.id} className={`${!isFirst ? 'pt-6 border-t border-gray-700' : ''}`}>
      {/* Title */}
      <h3 className="text-lg font-semibold text-amber-300 mb-2">{rule.name}</h3>

      {/* Summary */}
      <p className="text-gray-300 text-sm mb-4 bg-amber-900/20 px-3 py-2 rounded border-l-4 border-amber-600">
        {rule.summary}
      </p>

      {/* Description (rendered as simple markdown) */}
      <div className="prose prose-invert prose-amber prose-sm max-w-none mb-4">
        <SimpleMarkdown content={rule.description} />
      </div>

      {/* Tables */}
      {rule.tables && rule.tables.length > 0 && (
        <div className="space-y-4 mb-4">
          {rule.tables.map((table, idx) => (
            <RuleTableComponent key={idx} table={table} />
          ))}
        </div>
      )}

      {/* Examples */}
      {rule.examples && rule.examples.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Examples</h4>
          {rule.examples.map((example, idx) => (
            <ExampleCard key={idx} example={example} />
          ))}
        </div>
      )}

      {/* Tips */}
      {rule.tips && rule.tips.length > 0 && (
        <div className="bg-gray-800/50 rounded p-3 mb-4">
          <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips
          </h4>
          <ul className="space-y-1">
            {rule.tips.map((tip, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {rule.commonMistakes && rule.commonMistakes.length > 0 && (
        <div className="bg-red-900/20 rounded p-3 mb-4 border border-red-800/50">
          <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Common Mistakes
          </h4>
          <ul className="space-y-1">
            {rule.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-500">x</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Rules */}
      {rule.relatedRules && rule.relatedRules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Related:</span>
          {rule.relatedRules.map((relatedId) => {
            const related = getRuleById(relatedId)
            if (!related) return null
            return (
              <button
                key={relatedId}
                onClick={() => navigateTo(`${related.category}/${related.subcategory}#${related.id}`)}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                {related.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {rule.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

function RuleTableComponent({ table }: { table: RuleTable }) {
  return (
    <div className="overflow-x-auto">
      {table.caption && (
        <p className="text-sm font-medium text-gray-400 mb-2">{table.caption}</p>
      )}
      <table className="w-full text-sm border-2 border-amber-700">
        <thead className="bg-amber-900/30">
          <tr>
            {table.headers.map((header, idx) => (
              <th key={idx} className="px-3 py-2 text-left text-amber-300 border-b border-amber-700 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-700 last:border-0">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.footnotes && table.footnotes.length > 0 && (
        <div className="mt-2">
          {table.footnotes.map((note, idx) => (
            <p key={idx} className="text-xs text-gray-500 italic">* {note}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function ExampleCard({ example }: { example: RuleExample }) {
  return (
    <div className="bg-gray-800/50 rounded p-3 border-l-4 border-blue-600">
      <h5 className="text-sm font-medium text-blue-300 mb-1">{example.title}</h5>
      <p className="text-gray-300 text-sm">{example.description}</p>
      {example.diceNotation && (
        <p className="text-amber-400 text-sm mt-2 font-mono">{example.diceNotation}</p>
      )}
      {example.result && (
        <p className="text-green-400 text-sm mt-1">
          <span className="text-gray-500">Result:</span> {example.result}
        </p>
      )}
    </div>
  )
}

// Safe markdown-to-React converter using React elements only
function SimpleMarkdown({ content }: { content: string }) {
  const elements = useMemo(() => {
    const lines = content.split('\n')
    const result: React.ReactNode[] = []
    let currentList: string[] = []
    let listType: 'ul' | 'ol' | null = null
    let keyCounter = 0

    const getKey = () => `md-${keyCounter++}`

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType
        result.push(
          <ListTag key={getKey()} className={listType === 'ul' ? 'list-disc ml-4 space-y-1' : 'list-decimal ml-4 space-y-1'}>
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-300">{formatInline(item)}</li>
            ))}
          </ListTag>
        )
        currentList = []
        listType = null
      }
    }

    // Format inline text with bold and code - returns React elements
    const formatInline = (text: string): React.ReactNode => {
      const parts: React.ReactNode[] = []
      let remaining = text
      let partKey = 0

      while (remaining.length > 0) {
        // Check for bold **text**
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
        // Check for code `text`
        const codeMatch = remaining.match(/`([^`]+)`/)

        // Find which comes first
        const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1
        const codeIndex = codeMatch ? remaining.indexOf(codeMatch[0]) : -1

        if (boldIndex === -1 && codeIndex === -1) {
          // No more formatting, add remaining text
          if (remaining) parts.push(remaining)
          break
        }

        // Determine which match comes first
        let firstMatchIndex: number
        let firstMatch: RegExpMatchArray
        let type: 'bold' | 'code'

        if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
          firstMatchIndex = boldIndex
          firstMatch = boldMatch!
          type = 'bold'
        } else {
          firstMatchIndex = codeIndex
          firstMatch = codeMatch!
          type = 'code'
        }

        // Add text before the match
        if (firstMatchIndex > 0) {
          parts.push(remaining.slice(0, firstMatchIndex))
        }

        // Add the formatted element
        if (type === 'bold') {
          parts.push(
            <strong key={`inline-${partKey++}`} className="text-amber-300 font-semibold">
              {firstMatch[1]}
            </strong>
          )
        } else {
          parts.push(
            <code key={`inline-${partKey++}`} className="bg-gray-800 px-1 rounded text-amber-400">
              {firstMatch[1]}
            </code>
          )
        }

        // Continue with remaining text
        remaining = remaining.slice(firstMatchIndex + firstMatch[0].length)
      }

      return parts.length === 1 ? parts[0] : <>{parts}</>
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList()
        result.push(
          <h4 key={getKey()} className="text-amber-400 font-semibold mt-4 mb-2">
            {formatInline(trimmed.slice(4))}
          </h4>
        )
      } else if (trimmed.startsWith('## ')) {
        flushList()
        result.push(
          <h3 key={getKey()} className="text-amber-300 font-bold text-lg mt-4 mb-2">
            {formatInline(trimmed.slice(3))}
          </h3>
        )
      }
      // Unordered list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (listType !== 'ul') {
          flushList()
          listType = 'ul'
        }
        currentList.push(trimmed.slice(2))
      }
      // Ordered list
      else if (/^\d+\.\s/.test(trimmed)) {
        if (listType !== 'ol') {
          flushList()
          listType = 'ol'
        }
        currentList.push(trimmed.replace(/^\d+\.\s/, ''))
      }
      // Table (simple pipe format)
      else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList()
        // Skip table for now - we handle tables via the tables property
      }
      // Paragraph
      else if (trimmed.length > 0) {
        flushList()
        result.push(
          <p key={getKey()} className="text-gray-300 mb-3">
            {formatInline(trimmed)}
          </p>
        )
      }
    }

    flushList()
    return result
  }, [content])

  return <>{elements}</>
}
