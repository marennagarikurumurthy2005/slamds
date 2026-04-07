import { BookHeart } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="panel-strong hero-sheen animate-rise w-full max-w-2xl overflow-hidden rounded-[36px]">
        <div className="relative border-b border-[rgba(73,87,129,0.1)] px-6 py-8 sm:px-8 sm:py-9">
          <div className="glass-chip inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--accent)] text-white shadow-[var(--hero-shadow)]">
            <BookHeart className="h-8 w-8" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.36em] text-[var(--accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.94] tracking-tight text-[var(--ink)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
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
