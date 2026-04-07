import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-[var(--accent)] text-white shadow-[0_18px_38px_rgba(84,89,234,0.22)] hover:bg-[var(--accent-deep)]',
  secondary:
    'border border-[rgba(84,89,234,0.12)] bg-[rgba(255,255,255,0.82)] text-[var(--ink)] shadow-[0_12px_32px_rgba(74,88,146,0.08)] hover:bg-white',
  ghost:
    'bg-[rgba(84,89,234,0.08)] text-[var(--ink)] hover:bg-[rgba(84,89,234,0.14)]',
  danger:
    'bg-[var(--danger)] text-white shadow-[0_16px_34px_rgba(214,84,115,0.22)] hover:bg-[#bf4764]',
}

export default function Button({
  children,
  className,
  disabled = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
