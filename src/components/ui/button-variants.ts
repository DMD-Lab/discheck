export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'link' | 'danger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark rounded-md font-semibold',
  outline: 'border border-border text-text-secondary hover:text-primary hover:[border-color:var(--primary)] rounded-md bg-transparent',
  ghost:   'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md',
  link:    'text-primary hover:underline',
  danger:  'text-text-secondary hover:text-error',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

const noSize: ButtonVariant[] = ['link', 'danger']

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}): string {
  return [
    'inline-flex items-center justify-center gap-2 transition-colors',
    variantClasses[variant],
    !noSize.includes(variant) ? sizeClasses[size] : '',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ')
}
