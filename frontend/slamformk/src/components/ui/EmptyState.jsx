export default function EmptyState({ eyebrow, title, description, action }) {
  return (
    <div className="panel hero-sheen animate-rise rounded-[30px] px-6 py-10 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-tight text-[var(--ink)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
