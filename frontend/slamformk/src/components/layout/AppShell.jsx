import {
  BadgeCheck,
  BookHeart,
  BookOpenText,
  LogOut,
  PenSquare,
  Shield,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

function NavItem({ to, children }) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-[rgba(84,89,234,0.12)] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'
            : 'glass-chip text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]',
        )
      }
      to={to}
    >
      {children}
    </NavLink>
  )
}

export default function AppShell({ title, subtitle, actions, children }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="panel hero-sheen animate-rise rounded-[30px] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--accent)] text-white shadow-[var(--hero-shadow)]">
                  <BookHeart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                    MK Slam Collector
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {user?.name ?? user?.full_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                  <BadgeCheck className="h-4 w-4 text-[var(--mint)]" />
                  {user?.is_admin ? 'Django Superuser Access' : 'Personal Slam Workspace'}
                </div>
                <Button onClick={handleLogout} variant="ghost">
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <NavItem to="/dashboard">Home</NavItem>
              <NavItem to="/slams/new">
                <span className="inline-flex items-center gap-2">
                  <PenSquare className="h-4 w-4" />
                  Create Slam
                </span>
              </NavItem>
              <NavItem to="/slams">
                <span className="inline-flex items-center gap-2">
                  <BookOpenText className="h-4 w-4" />
                  My Slams
                </span>
              </NavItem>
              {user?.is_admin ? (
                <NavItem to="/admin">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </span>
                </NavItem>
              ) : null}
            </div>
          </div>
        </header>

        <section className="panel-strong hero-sheen animate-rise mt-6 overflow-hidden rounded-[34px] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="glass-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                {user?.is_admin ? 'Admin workspace' : 'Your space'}
              </div>
              <h1 className="mt-4 font-display text-4xl leading-none tracking-tight text-[var(--ink)] sm:text-5xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </section>

        <main className="mt-6 pb-10">{children}</main>
      </div>
    </div>
  )
}
