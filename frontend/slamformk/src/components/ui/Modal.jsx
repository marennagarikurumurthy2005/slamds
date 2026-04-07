import Button from './Button'

export default function Modal({
  cancelLabel = 'Cancel',
  children,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  description,
  onCancel,
  onConfirm,
  open,
  title,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,25,27,0.35)] px-4 py-6 backdrop-blur-sm">
      <div className="panel-strong hero-sheen fade-in w-full max-w-lg rounded-[30px] px-6 py-6 sm:px-8">
        <h3 className="font-display text-4xl tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        {description ? (
          <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{description}</p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button onClick={onCancel} variant="ghost">
            {cancelLabel}
          </Button>
          <Button disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
