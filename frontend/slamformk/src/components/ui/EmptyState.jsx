export default function EmptyState({ eyebrow, title, description, action }) {
  return (
    <div className="panel hero-sheen animate-rise rounded-[28px] px-5 py-8 text-center sm:rounded-[30px] sm:px-10 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
