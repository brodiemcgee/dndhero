'use client'

import { HTMLAttributes, ReactNode } from 'react'
import { cn } from './utils'

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  children: ReactNode
}

export function PixelPanel({ title, children, className, ...props }: PixelPanelProps) {
  return (
    <div
      className={cn(
        'bg-fantasy-brown border-4 border-fantasy-tan p-6',
        'pixel-border',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-fantasy-gold mb-4 text-xl font-bold border-b-2 border-fantasy-tan pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
