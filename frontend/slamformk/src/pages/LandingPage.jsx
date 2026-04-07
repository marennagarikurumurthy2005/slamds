import { ArrowRight, BookHeart, Shield, Sparkles } from 'lucide-react'
import { Navigate, Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function LandingPage() {
  const { user } = useAuth()

  if (user?.is_admin) {
    return <Navigate replace to="/admin" />
  }

  if (user) {
    return <Navigate replace to="/slams/new" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="animate-rise w-full max-w-6xl">
        <section className="panel-strong hero-sheen overflow-hidden rounded-[40px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
            <div>
              <div className="glass-chip inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[var(--hero-shadow)]">
                  <BookHeart className="h-5 w-5" />
                </span>
                MK Slam Collector
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.36em] text-[var(--accent)]">
                Personal slam book
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
                Premium, simple, and built for heartfelt words about MK.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Create your account, login, draft your slam, edit it any time before submission, and keep the whole experience smooth and beautiful.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button className="w-full sm:w-auto">
                    <span className="inline-flex items-center gap-2">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full sm:w-auto" variant="secondary">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  icon: Sparkles,
                  title: 'Edit before submit',
                  description: 'Draft, refine, and save changes until your slam feels perfect.',
                },
                {
                  icon: Shield,
                  title: 'Separate admin access',
                  description: 'App admin route is /admin. Django superuser admin stays on the backend /admin/.',
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="panel rounded-[28px] p-5"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(84,89,234,0.12)] text-[var(--accent)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
