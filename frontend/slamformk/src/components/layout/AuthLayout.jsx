import { Link } from 'react-router-dom'

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  alternateLabel,
  alternateLink,
  alternateText,
  children,
}) {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-4 sm:items-center sm:px-6 sm:py-8">
      <div className="panel-strong hero-sheen animate-rise w-full max-w-2xl overflow-hidden rounded-[28px] sm:rounded-[36px]">
        <div className="relative border-b border-[rgba(73,87,129,0.1)] px-5 py-6 sm:px-8 sm:py-9">
          <div className="flex items-center gap-3">
            <div className="glass-chip inline-flex h-14 flex-1 items-center rounded-[20px] px-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)] sm:h-16 sm:rounded-[22px] sm:text-xs sm:tracking-[0.3em]">
              MK Slam Collector
            </div>
            <div className="glass-chip h-14 w-14 overflow-hidden rounded-[20px] shadow-[var(--hero-shadow)] sm:h-16 sm:w-16 sm:rounded-[22px]">
              <img
                alt="MK"
                className="h-full w-full object-cover"
                src="/image.png"
              />
            </div>
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)] sm:text-xs sm:tracking-[0.36em]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-[0.96] tracking-tight text-[var(--ink)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {children}
          <div className="mt-6 border-t border-[rgba(73,87,129,0.1)] pt-5 text-center text-sm text-[var(--muted)]">
            {alternateLabel}{' '}
            <Link className="font-semibold text-[var(--accent)]" to={alternateLink}>
              {alternateText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
