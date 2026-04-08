import { ArrowLeft, Save, Send } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { buildBetterVersionText, buildWriteSlamText } from '../lib/slamSections'
import Modal from '../components/ui/Modal'
import { extractApiError } from '../lib/utils'
import { createSlam, getSlam, updateSlam } from '../services/slams'

const blankForm = {
  write_slam: '',
  how_would_you_describe: '',
  suggestions_or_message: '',
}

const sectionConfig = [
  [
    'write_slam',
    'Write slam',
    'Write everything you want to say about MK in one smooth message.',
  ],
  [
    'suggestions_or_message',
    'Suggest for my better version',
    'Share honest suggestions, advice, or anything MK can improve.',
  ],
]

export default function ComposePage() {
  const { slamId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(blankForm)
  const [isLoading, setIsLoading] = useState(Boolean(slamId))
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [slamStatus, setSlamStatus] = useState('draft')
  const answeredCount = sectionConfig.filter(([field]) => form[field].trim()).length
  const isSubmittedSlam = slamStatus === 'submitted'

  const loadSlam = useEffectEvent(async () => {
    if (!slamId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setFormError('')

    try {
      const slam = await getSlam(slamId)
      setSlamStatus(slam.status)
      setForm({
        write_slam: buildWriteSlamText(slam),
        how_would_you_describe: '',
        suggestions_or_message: buildBetterVersionText(slam),
      })
    } catch (error) {
      setFormError(extractApiError(error, 'Unable to load this slam right now.'))
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadSlam()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function validateForSubmit() {
    const missing = sectionConfig
      .filter(([field]) => !form[field].trim())
      .map(([, label]) => label)

    if (missing.length > 0) {
      setFormError(
        `Please answer all questions before submitting or updating. Missing: ${missing.join(', ')}`
      )
      return false
    }

    return true
  }

  async function persistSlam(status) {
    setIsSaving(true)
    setFormError('')

    try {
      const payload = {
        what_do_you_think: form.write_slam.trim(),
        how_would_you_describe: '',
        best_memory: '',
        suggestions_or_message: form.suggestions_or_message.trim(),
        status,
      }

      if (slamId) {
        await updateSlam(slamId, payload)
      } else {
        await createSlam(payload)
      }

      navigate('/slams', { replace: true })
    } catch (error) {
      setFormError(extractApiError(error, 'Unable to save your slam right now.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveChanges() {
    await persistSlam(isSubmittedSlam ? 'submitted' : 'draft')
  }

  function handleSubmitConfirm() {
    if (!validateForSubmit()) {
      return
    }

    setSubmitModalOpen(true)
  }

  async function handleSubmitSlam() {
    setSubmitModalOpen(false)
    await persistSlam('submitted')
  }

  return (
    <AppShell
      actions={
        <Link to="/slams">
          <Button className="w-full sm:w-auto" variant="ghost">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Slams
            </span>
          </Button>
        </Link>
      }
      subtitle="Write freely, save your progress, and come back anytime to refine or update the same slam."
      title={slamId ? 'Edit your slam' : 'Write a new slam for MK'}
    >
      {isLoading ? (
        <div className="panel animate-rise rounded-[30px] p-6 text-sm text-[var(--muted)]">
          Loading your slam...
        </div>
      ) : (
        <section className="panel hero-sheen animate-rise rounded-[28px] p-4 sm:rounded-[30px] sm:p-7">
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="glass-chip rounded-[22px] px-4 py-4 sm:rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Editing progress
              </p>
              <p className="mt-2 font-display text-4xl text-[var(--ink)]">
                {answeredCount}/{sectionConfig.length}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Complete both sections before you submit or update this slam.
              </p>
            </div>
            <div className="glass-chip rounded-[22px] px-4 py-4 sm:rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Current mode
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink)]">
                {!slamId
                  ? 'Creating new draft'
                  : isSubmittedSlam
                    ? 'Updating submitted slam'
                    : 'Editing saved draft'}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Save your work at any time, then submit again whenever you want to refresh the submitted version.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {sectionConfig.map(([field, label, description]) => (
              <div key={field} className="soft-ring rounded-[24px] bg-white/78 p-4 sm:rounded-[28px] sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
                <div className="mt-4">
                  <FormField
                    as="textarea"
                    className="bg-white"
                    label="Your answer"
                    onChange={(event) => updateField(field, event.target.value)}
                    placeholder={description}
                    rows={field === 'write_slam' ? 10 : 6}
                    value={form[field]}
                  />
                </div>
              </div>
            ))}
          </div>

          {formError ? (
            <div className="mt-5 rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
              {formError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button className="w-full sm:w-auto" disabled={isSaving} onClick={handleSaveChanges} variant="secondary">
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : slamId ? 'Save changes' : 'Save draft'}
              </span>
            </Button>
            <Button className="w-full sm:w-auto" disabled={isSaving} onClick={handleSubmitConfirm}>
              <span className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                {isSubmittedSlam ? 'Update slam' : 'Submit slam'}
              </span>
            </Button>
          </div>
        </section>
      )}

      <Modal
        cancelLabel="Keep editing"
        confirmLabel={isSubmittedSlam ? 'Yes, update it' : 'Yes, submit it'}
        description={
          isSubmittedSlam
            ? 'This will replace your previous submitted version with your latest answers.'
            : 'This will save your answers as a submitted slam. You can still return later and update it.'
        }
        onCancel={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmitSlam}
        open={submitModalOpen}
        title={isSubmittedSlam ? 'Update this slam?' : 'Ready to submit?'}
      />
    </AppShell>
  )
}
