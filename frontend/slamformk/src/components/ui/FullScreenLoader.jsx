export default function FullScreenLoader({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel animate-rise flex w-full max-w-lg flex-col items-center rounded-[30px] px-8 py-12 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[rgba(31,41,46,0.1)] border-t-[var(--accent)]" />
        <p className="mt-5 font-display text-4xl text-[var(--ink)]">One moment</p>
        <p className="mt-2 max-w-md text-[15px] leading-7 text-[var(--muted)]">{message}</p>
      </div>
    </div>
  )
}
