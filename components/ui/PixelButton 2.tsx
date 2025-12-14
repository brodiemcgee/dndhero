'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from './utils'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variantStyles = {
      primary: 'border-fantasy-gold bg-fantasy-brown hover:bg-fantasy-gold hover:border-fantasy-gold text-fantasy-light',
      secondary: 'border-fantasy-moss bg-fantasy-dark hover:bg-fantasy-moss hover:border-fantasy-moss text-fantasy-light',
      danger: 'border-fantasy-red bg-fantasy-dark hover:bg-fantasy-red hover:border-fantasy-red text-fantasy-light',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'retro-button',
          variantStyles[variant],
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

PixelButton.displayName = 'PixelButton'

export { PixelButton }
