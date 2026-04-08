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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,25,27,0.35)] px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="panel-strong hero-sheen fade-in w-full max-w-lg rounded-[28px] px-5 py-6 sm:rounded-[30px] sm:px-8">
        <h3 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          {title}
        </h3>
        {description ? (
          <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{description}</p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={onCancel} variant="ghost">
            {cancelLabel}
          </Button>
          <Button className="w-full sm:w-auto" disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
