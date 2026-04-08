import {
  BadgeCheck,
  BookHeart,
  BookOpenText,
  House,
  LogOut,
  PenSquare,
  Shield,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

function NavItem({ icon: Icon, mobile = false, to, children }) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          mobile
            ? 'flex min-w-0 flex-col items-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-semibold transition'
            : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? mobile
              ? 'bg-[rgba(84,89,234,0.12)] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'
              : 'bg-[rgba(84,89,234,0.12)] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'
            : mobile
              ? 'text-[var(--muted)] hover:bg-white/80 hover:text-[var(--ink)]'
              : 'glass-chip text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]',
        )
      }
      to={to}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </NavLink>
  )
}

export default function AppShell({ title, subtitle, actions, children }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const navItems = [
    {
      icon: House,
      label: 'Home',
      to: '/dashboard',
    },
    {
      icon: PenSquare,
      label: 'Write',
      to: '/slams/new',
    },
    {
      icon: BookOpenText,
      label: 'My Slams',
      to: '/slams',
    },
  ]

  if (user?.is_admin) {
    navItems.push({
      icon: Shield,
      label: 'Admin',
      to: '/admin',
    })
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="panel hero-sheen animate-rise rounded-[28px] px-4 py-4 sm:rounded-[30px] sm:px-6 sm:py-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] bg-[var(--accent)] text-white shadow-[var(--hero-shadow)] sm:h-12 sm:w-12 sm:rounded-[18px]">
                  <BookHeart className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)] sm:text-xs sm:tracking-[0.28em]">
                    MK Slam Collector
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--ink)]">
                    {user?.name ?? user?.full_name}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="glass-chip hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] sm:inline-flex">
                  <BadgeCheck className="h-4 w-4 text-[var(--mint)]" />
                  {user?.is_admin ? 'Django Superuser Access' : 'Personal Slam Workspace'}
                </div>
                <Button className="px-4 py-2.5" onClick={handleLogout} variant="ghost">
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </span>
                </Button>
              </div>
            </div>

            <div className="glass-chip inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] sm:hidden">
              <BadgeCheck className="h-4 w-4 text-[var(--mint)]" />
              {user?.is_admin ? 'Admin workspace' : 'Slam workspace'}
            </div>

            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {navItems.map((item) => (
                <NavItem icon={item.icon} key={item.to} to={item.to}>
                  {item.label}
                </NavItem>
              ))}
            </div>
          </div>
        </header>

        <section className="panel-strong hero-sheen animate-rise mt-5 overflow-hidden rounded-[30px] px-5 py-6 sm:mt-6 sm:rounded-[34px] sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="glass-chip inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)] sm:text-xs sm:tracking-[0.28em]">
                {user?.is_admin ? 'Admin workspace' : 'Your space'}
              </div>
              <h1 className="mt-4 font-display text-3xl leading-none tracking-tight text-[var(--ink)] sm:text-5xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? <div className="w-full shrink-0 sm:w-auto">{actions}</div> : null}
          </div>
        </section>

        <main className="mt-5 pb-28 sm:mt-6 sm:pb-10">{children}</main>
      </div>

      <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
        <div
          className={cn(
            'panel-strong pointer-events-auto mx-auto grid max-w-sm gap-1 rounded-[28px] p-2',
            navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-3',
          )}
        >
          {navItems.map((item) => (
            <NavItem icon={item.icon} key={item.to} mobile to={item.to}>
              {item.label}
            </NavItem>
          ))}
        </div>
      </nav>
    </div>
  )
}
