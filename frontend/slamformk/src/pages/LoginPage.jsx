import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { useAuth } from '../hooks/useAuth'
import { extractApiError } from '../lib/utils'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const { isAuthenticated, isBooting, login } = useAuth()
  const [apiError, setApiError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  if (!isBooting && isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  async function onSubmit(values) {
    setApiError('')

    try {
      const user = await login(values)
      const fallbackPath = user?.is_admin ? '/admin' : '/slams/new'
      navigate(location.state?.from?.pathname ?? fallbackPath, { replace: true })
    } catch (error) {
      setApiError(extractApiError(error, 'Unable to log you in right now.'))
    }
  }

  return (
    <AuthLayout
      alternateLabel="Don't have an account?"
      alternateLink="/signup"
      alternateText="Create account"
      eyebrow="Welcome back"
      subtitle="Login to your slam workspace, continue editing drafts, and submit your final words when they feel perfect."
      title="Login"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.email?.message}
          label="Email"
          placeholder="example@gmail.com"
          type="email"
          {...register('email')}
        />
        <FormField
          error={errors.password?.message}
          label="Password"
          placeholder="Enter your password"
          type="password"
          {...register('password')}
        />
        {apiError ? (
          <div className="rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
            {apiError}
          </div>
        ) : null}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </AuthLayout>
  )
}
