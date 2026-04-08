import { cn } from '../../lib/utils'

export default function FormField({
  as = 'input',
  className,
  error,
  label,
  rows = 5,
  ...props
}) {
  const Element = as

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">
        {label}
      </span>
      <Element
        className={cn(
          'w-full rounded-[22px] border border-[var(--line)] bg-white/88 px-4 py-3.5 text-base text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-[rgba(20,33,61,0.38)] focus:border-[rgba(84,89,234,0.42)] focus:ring-4 focus:ring-[rgba(84,89,234,0.12)] sm:rounded-[24px]',
          error && 'border-[rgba(214,84,115,0.48)] focus:border-[rgba(214,84,115,0.62)] focus:ring-[rgba(214,84,115,0.12)]',
          className,
        )}
        rows={rows}
        {...props}
      />
      {error ? (
        <span className="mt-2 block text-sm font-medium text-[#b6493d]">{error}</span>
      ) : null}
    </label>
  )
}
