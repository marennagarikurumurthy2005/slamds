import { Clock3, PencilLine, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildBetterVersionText, buildWriteSlamText } from '../lib/slamSections'
import { formatDateTime, shorten } from '../lib/utils'
import Button from './ui/Button'

function AnswerPreview({ label, value }) {
  return (
    <div className="glass-chip rounded-[20px] p-4 sm:rounded-[22px]">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] break-words sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--ink)] break-words">
        {shorten(value, 170)}
      </p>
    </div>
  )
}

export default function SlamCard({ onDelete, slam }) {
  const isDraft = slam.status === 'draft'
  const canEdit = slam.can_edit !== false
  const writeSlam = buildWriteSlamText(slam)
  const betterVersion = buildBetterVersionText(slam)

  return (
    <article className="panel hero-sheen animate-rise rounded-[26px] p-4 sm:rounded-[30px] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {isDraft ? (
              <>
                <Clock3 className="h-3.5 w-3.5" />
                Draft
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submitted
              </>
            )}
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Created {formatDateTime(slam.created_at)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Last updated {formatDateTime(slam.updated_at)}
          </p>
          {slam.submitted_at ? (
            <p className="mt-1 text-sm text-[var(--muted)]">
              Submitted {formatDateTime(slam.submitted_at)}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {canEdit ? (
            <Link to={`/slams/${slam.id}/edit`}>
              <Button className="w-full" variant="secondary">
                <span className="inline-flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  {isDraft ? 'Edit slam' : 'Update slam'}
                </span>
              </Button>
            </Link>
          ) : null}
          {onDelete ? (
            <Button className="w-full" onClick={() => onDelete(slam)} variant="danger">
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </span>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <AnswerPreview label="Write slam" value={writeSlam} />
        <AnswerPreview label="Suggestions" value={betterVersion} />
      </div>
    </article>
  )
}
