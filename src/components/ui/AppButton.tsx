'use client'

import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { buttonVariants, type ButtonVariant, type ButtonSize } from './button-variants'

export { buttonVariants, type ButtonVariant, type ButtonSize } from './button-variants'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

export default function AppButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...rest
}: AppButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={buttonVariants({
        variant,
        size,
        fullWidth,
        className: `${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className ?? ''}`,
      })}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}
