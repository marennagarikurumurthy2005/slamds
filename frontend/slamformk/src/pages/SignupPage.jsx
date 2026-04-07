import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { useAuth } from '../hooks/useAuth'
import { extractApiError } from '../lib/utils'

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name should be at least 2 characters.'),
    email: z.string().email('Enter a valid email address.'),
    roll_number: z.string().min(2, 'Roll number is required.'),
    password: z
      .string()
      .min(8, 'Password should be at least 8 characters.')
      .regex(/[A-Za-z]/, 'Password should include at least one letter.')
      .regex(/[0-9]/, 'Password should include at least one number.'),
    confirm_password: z.string().min(8, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  })

export default function SignupPage() {
  const { isAuthenticated, isBooting, signup } = useAuth()
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  if (!isBooting && isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  async function onSubmit(values) {
    setApiError('')

    try {
      await signup(values)
      navigate('/slams/new', { replace: true })
    } catch (error) {
      setApiError(extractApiError(error, 'Unable to create your account right now.'))
    }
  }

  return (
    <AuthLayout
      alternateLabel="Already have an account?"
      alternateLink="/login"
      alternateText="Login"
      eyebrow="Start your page"
      subtitle="Open your own polished space in MK Slam Collector and begin writing whenever you feel ready."
      title="Create your account"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.name?.message}
          label="Name"
          placeholder="Your full name"
          {...register('name')}
        />
        <FormField
          error={errors.email?.message}
          label="Email"
          placeholder="example@gmail.com"
          type="email"
          {...register('email')}
        />
        <FormField
          error={errors.roll_number?.message}
          label="Roll Number"
          placeholder="22S11A6XXX"
          {...register('roll_number')}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            error={errors.password?.message}
            label="Password"
            placeholder="Create a strong password"
            type="password"
            {...register('password')}
          />
          <FormField
            error={errors.confirm_password?.message}
            label="Confirm Password"
            placeholder="Repeat your password"
            type="password"
            {...register('confirm_password')}
          />
        </div>
        {apiError ? (
          <div className="rounded-[22px] border border-[rgba(214,84,115,0.24)] bg-[rgba(255,241,245,0.92)] px-4 py-3 text-sm text-[#a63d58]">
            {apiError}
          </div>
        ) : null}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
