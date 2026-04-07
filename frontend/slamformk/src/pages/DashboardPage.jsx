import { ArrowRight, BookOpenText, LayoutDashboard, PenSquare, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = Boolean(user?.is_admin)

  return (
    <AppShell
      subtitle={
        isAdmin
          ? 'Create a new slam, open your drafts, and jump straight into the admin dashboard when you need it.'
          : 'Create a slam, come back to edit it anytime, and manage all your entries in one simple place.'
      }
      title={`Welcome, ${user?.name ?? user?.full_name ?? 'Writer'}`}
    >
      <section className={`grid gap-4 ${isAdmin ? 'lg:grid-cols-[1.2fr_0.8fr]' : ''}`}>
        <div className={`grid gap-4 ${isAdmin ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`}>
          <Link
            className="panel hero-sheen animate-rise rounded-[28px] p-6 transition hover:-translate-y-0.5"
            to="/slams/new"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(84,89,234,0.12)] text-[var(--accent)]">
              <PenSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Create slam</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Start a fresh draft and keep editing until you are ready to submit.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              Start writing
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>

          <Link
            className="panel hero-sheen animate-rise rounded-[28px] p-6 transition hover:-translate-y-0.5"
            to="/slams"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(19,185,130,0.12)] text-[var(--mint)]">
              <BookOpenText className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">My slams</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Review your drafts and submitted slams in one calm, polished view.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              Open library
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
        </div>

        {isAdmin ? (
          <div className="panel animate-rise rounded-[28px] p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(139,92,246,0.12)] text-[var(--purple)]">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Workspace details</h2>
            <div className="mt-4 grid gap-3">
              <div className="glass-chip rounded-[22px] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  App admin route
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">/admin</p>
              </div>
              <div className="glass-chip rounded-[22px] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Django superuser admin
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Backend /admin/</p>
              </div>
            </div>

            <div className="mt-5">
              <Link to="/admin">
                <Button className="w-full" variant="secondary">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Open admin dashboard
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}
