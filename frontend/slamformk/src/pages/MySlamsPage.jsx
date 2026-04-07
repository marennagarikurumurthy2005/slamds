import { useEffect, useEffectEvent, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import SlamCard from '../components/SlamCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { extractApiError } from '../lib/utils'
import { deleteSlam, listSlams } from '../services/slams'

const filterMap = {
  all: () => true,
  draft: (slam) => slam.status === 'draft',
  submitted: (slam) => slam.status === 'submitted',
}

export default function MySlamsPage() {
  const { user } = useAuth()
  const [data, setData] = useState({ meta: null, results: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedSlam, setSelectedSlam] = useState(null)
  const [isPending, startTransition] = useTransition()

  const loadSlams = useEffectEvent(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await listSlams()
      setData(response)
    } catch (fetchError) {
      setError(extractApiError(fetchError, 'Unable to load your slams right now.'))
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadSlams()
  }, [user?.id])

  const visibleSlams = data.results.filter(filterMap[activeFilter])

  async function handleDeleteConfirm() {
    if (!selectedSlam) {
      return
    }

    try {
      await deleteSlam(selectedSlam.id)
      setSelectedSlam(null)
      const response = await listSlams()
      setData(response)
    } catch (deleteError) {
      setError(extractApiError(deleteError, 'Unable to delete this slam right now.'))
    }
  }

  return (
    <AppShell
      actions={
        <Link to="/slams/new">
          <Button>Write another slam</Button>
        </Link>
      }
      subtitle="Drafts stay editable, and submitted slams can be reopened any time for updates. Anything you delete quietly disappears from your own view."
      title="Your slam library"
    >
      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="panel hero-sheen animate-rise rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Filter your entries
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Switch between drafts and submitted slams, then reopen any entry whenever you want to refine it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'All'],
                ['draft', 'Drafts'],
                ['submitted', 'Submitted'],
              ].map(([value, label]) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === value
                      ? 'bg-[var(--accent)] text-white shadow-[0_14px_26px_rgba(84,89,234,0.18)]'
                      : 'glass-chip text-[var(--ink)] hover:bg-white'
                  }`}
                  key={value}
                  onClick={() => startTransition(() => setActiveFilter(value))}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            ['Total', data.meta?.count ?? 0],
            ['Drafts', data.meta?.drafts ?? 0],
            ['Submitted', data.meta?.submitted ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="panel animate-rise rounded-[26px] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {label}
              </p>
              <p className="mt-3 font-display text-4xl text-[var(--ink)]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {isLoading || isPending ? (
        <div className="mt-6 panel animate-rise rounded-[28px] p-6 text-sm text-[var(--muted)]">
          Loading your slam entries...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
          {error}
        </div>
      ) : visibleSlams.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            action={
              <Link to="/slams/new">
                <Button>Start writing now</Button>
              </Link>
            }
            description="Once you create a draft or submit a slam, it will appear here for easy review."
            eyebrow="No matches"
            title="Nothing in this section yet."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {visibleSlams.map((slam) => (
            <SlamCard key={slam.id} onDelete={setSelectedSlam} slam={slam} />
          ))}
        </div>
      )}

      <Modal
        cancelLabel="Keep slam"
        confirmLabel="Soft delete"
        description="This slam will disappear from your dashboard."
        onCancel={() => setSelectedSlam(null)}
        onConfirm={handleDeleteConfirm}
        open={Boolean(selectedSlam)}
        title="Delete this slam?"
      />
    </AppShell>
  )
}
