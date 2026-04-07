import {
  Eye,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Sparkles,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import FormField from '../components/ui/FormField'
import { buildBetterVersionText, buildWriteSlamText } from '../lib/slamSections'
import Modal from '../components/ui/Modal'
import { extractApiError, formatDateTime, shorten } from '../lib/utils'
import {
  getAdminUserDetail,
  listAdminSlams,
  listAdminUsers,
  resetUserPassword,
} from '../services/admin'

function AdminMetricCard({ label, tone = 'accent', value }) {
  const accentClass = {
    accent: 'text-[var(--accent)]',
    mint: 'text-[var(--mint)]',
    purple: 'text-[var(--purple)]',
    sky: 'text-[var(--sky)]',
  }[tone]

  return (
    <article className="panel animate-rise rounded-[26px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className={`mt-3 font-display text-4xl ${accentClass}`}>{value}</p>
    </article>
  )
}

function AdminSlamAnswer({ label, value, showFullContent = false }) {
  const content = value?.trim() ? value : 'No content added yet.'

  return (
    <div className="glass-chip min-w-0 rounded-[22px] p-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] break-words sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-2 text-sm leading-6 text-[var(--ink)] break-words ${
          showFullContent ? 'whitespace-pre-wrap' : ''
        }`}
      >
        {showFullContent ? content : shorten(content, 220)}
      </p>
    </div>
  )
}

function AdminSlamItem({ showFullContent = false, slam }) {
  const writeSlam = buildWriteSlamText(slam)
  const betterVersion = buildBetterVersionText(slam)

  return (
    <article className="panel rounded-[26px] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold leading-7 text-[var(--ink)] break-words">
            {slam.writer_name} - {slam.writer_roll_number}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)] break-words">{slam.writer_email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="glass-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {slam.status}
            </span>
            {slam.is_deleted ? (
              <span className="rounded-full bg-[rgba(214,84,115,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b13e5d]">
                Deleted
              </span>
            ) : (
              <span className="rounded-full bg-[rgba(19,185,130,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">
                Active
              </span>
            )}
          </div>
        </div>
        <div className="max-w-full text-sm leading-6 text-[var(--muted)] lg:text-right">
          <p>Updated {formatDateTime(slam.updated_at)}</p>
          {slam.submitted_at ? <p className="mt-1">Submitted {formatDateTime(slam.submitted_at)}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <AdminSlamAnswer label="Write slam" showFullContent={showFullContent} value={writeSlam} />
        <AdminSlamAnswer
          label="Suggestions"
          showFullContent={showFullContent}
          value={betterVersion}
        />
      </div>
    </article>
  )
}

function UserDetailStat({ label, value }) {
  return (
    <div className="glass-chip rounded-[20px] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-[var(--ink)]">{value}</p>
    </div>
  )
}

export default function AdminPage() {
  const [slamSearch, setSlamSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletedFilter, setDeletedFilter] = useState('all')
  const [ordering, setOrdering] = useState('-updated_at')
  const [slamsData, setSlamsData] = useState({ meta: null, results: [] })
  const [slamsLoading, setSlamsLoading] = useState(true)
  const [slamsError, setSlamsError] = useState('')

  const [userSearch, setUserSearch] = useState('')
  const [usersData, setUsersData] = useState({ meta: null, results: [] })
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserDetail, setSelectedUserDetail] = useState(null)
  const [selectedUserLoading, setSelectedUserLoading] = useState(false)
  const [selectedUserError, setSelectedUserError] = useState('')
  const [passwordDialogUser, setPasswordDialogUser] = useState(null)
  const [passwordDraft, setPasswordDraft] = useState('')
  const [passwordDialogError, setPasswordDialogError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [resetInfo, setResetInfo] = useState(null)

  useEffect(() => {
    async function loadSlams() {
      setSlamsLoading(true)
      setSlamsError('')

      try {
        const params = { ordering }
        if (slamSearch.trim()) {
          params.search = slamSearch.trim()
        }
        if (statusFilter !== 'all') {
          params.status = statusFilter
        }
        if (deletedFilter !== 'all') {
          params.deleted = deletedFilter
        }

        const response = await listAdminSlams(params)
        setSlamsData(response)
      } catch (error) {
        setSlamsError(extractApiError(error, 'Unable to load slams right now.'))
      } finally {
        setSlamsLoading(false)
      }
    }

    loadSlams()
  }, [deletedFilter, ordering, slamSearch, statusFilter])

  useEffect(() => {
    async function loadUsers() {
      setUsersLoading(true)
      setUsersError('')

      try {
        const params = {}
        if (userSearch.trim()) {
          params.search = userSearch.trim()
        }

        const response = await listAdminUsers(params)
        setUsersData(response)
      } catch (error) {
        setUsersError(extractApiError(error, 'Unable to load users right now.'))
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, [userSearch])

  useEffect(() => {
    if (usersData.results.length === 0) {
      setSelectedUserId('')
      setSelectedUserDetail(null)
      return
    }

    const selectedStillVisible = usersData.results.some((user) => user.id === selectedUserId)
    if (!selectedUserId || !selectedStillVisible) {
      setSelectedUserId(usersData.results[0].id)
    }
  }, [selectedUserId, usersData.results])

  useEffect(() => {
    async function loadSelectedUser() {
      if (!selectedUserId) {
        setSelectedUserDetail(null)
        return
      }

      setSelectedUserLoading(true)
      setSelectedUserError('')

      try {
        const response = await getAdminUserDetail(selectedUserId)
        setSelectedUserDetail(response)
      } catch (error) {
        setSelectedUserError(extractApiError(error, 'Unable to load this user right now.'))
      } finally {
        setSelectedUserLoading(false)
      }
    }

    loadSelectedUser()
  }, [selectedUserId])

  function openPasswordDialog(user) {
    setPasswordDialogUser(user)
    setPasswordDraft('')
    setPasswordDialogError('')
  }

  function closePasswordDialog() {
    if (isChangingPassword) {
      return
    }

    setPasswordDialogUser(null)
    setPasswordDraft('')
    setPasswordDialogError('')
  }

  async function handleChangePassword() {
    if (!passwordDialogUser || isChangingPassword) {
      return
    }

    const targetUser = passwordDialogUser
    const typedPassword = passwordDraft

    setIsChangingPassword(true)
    setPasswordDialogError('')

    try {
      const response = await resetUserPassword(
        targetUser.id,
        typedPassword.trim() ? { new_password: typedPassword } : {}
      )
      setPasswordDialogUser(null)
      setPasswordDraft('')
      setResetInfo({
        password: response.temporary_password,
        userName: targetUser.full_name ?? targetUser.name,
        mode: typedPassword.trim() ? 'custom' : 'generated',
      })
    } catch (error) {
      setPasswordDialogError(
        extractApiError(error, 'Unable to change this password right now.')
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  const selectedUser = selectedUserDetail?.user
  const selectedStats = selectedUserDetail?.stats

  return (
    <AppShell
      subtitle="Separate premium admin workspace for Django superusers only. Passwords stay hashed and hidden, but you can set a new password for any user whenever they need help accessing their account."
      title="Admin dashboard"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Users" tone="sky" value={usersData.meta?.count ?? 0} />
        <AdminMetricCard label="All slams" tone="accent" value={slamsData.meta?.total ?? 0} />
        <AdminMetricCard label="Active slams" tone="mint" value={slamsData.meta?.active ?? 0} />
        <AdminMetricCard label="Deleted slams" tone="purple" value={slamsData.meta?.deleted ?? 0} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="panel hero-sheen animate-rise rounded-[30px] p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(84,89,234,0.12)] text-[var(--accent)]">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">Route guide</h2>
          <div className="mt-4 grid gap-3">
            <div className="glass-chip rounded-[22px] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                App admin route
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink)]">/admin</p>
            </div>
            <div className="glass-chip rounded-[22px] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Django superuser admin
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink)]">Backend /admin/</p>
            </div>
          </div>
        </article>

        <article className="panel hero-sheen animate-rise rounded-[30px] p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(19,185,130,0.12)] text-[var(--mint)]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">Security note</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] break-words">
            Passwords are never shown in plain text after storage, which keeps accounts safe. Instead, this admin workspace lets you set a fresh password yourself or generate a secure temporary one for the user.
          </p>
        </article>
      </section>

      <section className="panel animate-rise mt-6 rounded-[30px] p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Search slams"
            onChange={(event) => setSlamSearch(event.target.value)}
            placeholder="Name, email, roll number, or content"
            value={slamSearch}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">
              Status
            </span>
            <select
              className="w-full rounded-[24px] border border-[var(--line)] bg-white/84 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[rgba(84,89,234,0.42)]"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">
              Deleted
            </span>
            <select
              className="w-full rounded-[24px] border border-[var(--line)] bg-white/84 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[rgba(84,89,234,0.42)]"
              onChange={(event) => setDeletedFilter(event.target.value)}
              value={deletedFilter}
            >
              <option value="all">All</option>
              <option value="false">Only active</option>
              <option value="true">Only deleted</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">
              Order
            </span>
            <select
              className="w-full rounded-[24px] border border-[var(--line)] bg-white/84 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[rgba(84,89,234,0.42)]"
              onChange={(event) => setOrdering(event.target.value)}
              value={ordering}
            >
              <option value="-updated_at">Latest updated</option>
              <option value="updated_at">Oldest updated</option>
              <option value="-submitted_at">Latest submitted</option>
              <option value="submitted_at">Oldest submitted</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel animate-rise mt-6 rounded-[30px] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--ink)]">All slams</h2>
        </div>

        {slamsLoading ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Loading slams...</p>
        ) : slamsError ? (
          <div className="mt-4 rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
            {slamsError}
          </div>
        ) : slamsData.results.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              description="No slams match the current filters."
              eyebrow="No results"
              title="Nothing to review."
            />
          </div>
        ) : (
            <div className="mt-4 grid gap-4">
              {slamsData.results.map((slam) => (
                <AdminSlamItem key={slam.id} slam={slam} />
              ))}
            </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel animate-rise rounded-[30px] p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--ink)]">Users</h2>
          </div>

          <div className="mt-4">
            <FormField
              label="Search users"
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Name, email, or roll number"
              value={userSearch}
            />
          </div>

          {usersLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Loading users...</p>
          ) : usersError ? (
            <div className="mt-4 rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
              {usersError}
            </div>
          ) : usersData.results.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No users found.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {usersData.results.map((user) => {
                const isSelected = user.id === selectedUserId

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`text-left rounded-[24px] p-4 transition ${
                      isSelected
                        ? 'bg-[rgba(84,89,234,0.1)] shadow-[0_16px_34px_rgba(84,89,234,0.12)]'
                        : 'glass-chip hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--ink)]">{user.full_name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{user.roll_number}</p>
                      </div>
                      {user.is_admin ? (
                        <span className="rounded-full bg-[rgba(84,89,234,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Admin
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </article>

        <article className="panel animate-rise rounded-[30px] p-5">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--ink)]">Selected user</h2>
          </div>

          {selectedUserLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Loading user details...</p>
          ) : selectedUserError ? (
            <div className="mt-4 rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
              {selectedUserError}
            </div>
          ) : !selectedUser ? (
            <div className="mt-4">
              <EmptyState
                description="Choose a user from the list to open their full dashboard."
                eyebrow="No user selected"
                title="Pick someone to inspect."
              />
            </div>
          ) : (
            <div className="mt-4">
              <div className="hero-sheen rounded-[28px] bg-[rgba(84,89,234,0.08)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold text-[var(--ink)] break-words">{selectedUser.full_name}</p>
                    <p className="mt-2 text-sm text-[var(--muted)] break-words">{selectedUser.email}</p>
                    <p className="mt-1 text-sm text-[var(--muted)] break-words">{selectedUser.roll_number}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="glass-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {selectedUser.is_admin ? (
                        <span className="rounded-full bg-[rgba(84,89,234,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Django superuser
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Button className="shrink-0" onClick={() => openPasswordDialog(selectedUser)} variant="secondary">
                    <span className="inline-flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Change password
                    </span>
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <UserDetailStat label="Total slams" value={selectedStats?.total_slams ?? 0} />
                <UserDetailStat label="Drafts" value={selectedStats?.draft_slams ?? 0} />
                <UserDetailStat label="Submitted" value={selectedStats?.submitted_slams ?? 0} />
                <UserDetailStat label="Deleted" value={selectedStats?.deleted_slams ?? 0} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="glass-chip rounded-[22px] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Joined
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                    {formatDateTime(selectedUser.date_joined)}
                  </p>
                </div>
                <div className="glass-chip rounded-[22px] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Last login
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                    {selectedUser.last_login ? formatDateTime(selectedUser.last_login) : 'Not available yet'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-semibold text-[var(--ink)]">
                  All slams by this user
                </h3>
                {selectedUserDetail.slams.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">No slams created yet.</p>
                ) : (
                  <div className="mt-4 grid gap-4">
                    {selectedUserDetail.slams.map((slam) => (
                      <AdminSlamItem key={slam.id} showFullContent slam={slam} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </section>

      <Modal
        cancelLabel="Cancel"
        confirmDisabled={isChangingPassword}
        confirmLabel={
          isChangingPassword
            ? 'Saving...'
            : passwordDraft.trim()
              ? 'Set password'
              : 'Generate password'
        }
        description={
          passwordDialogUser
            ? `Set a new password for ${passwordDialogUser.full_name}. Leave the field blank if you want the system to generate a secure temporary password instead.`
            : ''
        }
        onCancel={closePasswordDialog}
        onConfirm={handleChangePassword}
        open={Boolean(passwordDialogUser)}
        title="Change user password"
      >
        <div className="grid gap-4">
          <FormField
            autoComplete="new-password"
            error={passwordDialogError}
            label="New password"
            onChange={(event) => setPasswordDraft(event.target.value)}
            placeholder="Enter a new password or leave blank to auto-generate"
            type="password"
            value={passwordDraft}
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Use at least 8 characters. A stronger password with letters and numbers is recommended.
          </p>
        </div>
      </Modal>

      <Modal
        cancelLabel="Close"
        confirmLabel="Close"
        description={
          resetInfo
            ? resetInfo.mode === 'custom'
              ? `Password updated for ${resetInfo.userName}. The current password is now: ${resetInfo.password}`
              : `Temporary password for ${resetInfo.userName}: ${resetInfo.password}. Share it only with the user and ask them to change it immediately after login.`
            : ''
        }
        onCancel={() => setResetInfo(null)}
        onConfirm={() => setResetInfo(null)}
        open={Boolean(resetInfo)}
        title={resetInfo?.mode === 'custom' ? 'Password updated' : 'Temporary password created'}
      />
    </AppShell>
  )
}
