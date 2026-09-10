'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'
import { Panel, Field, TextInput, FormMessage } from '@/components/form'
import { Spinner } from '@/components/spinner'
import { apiJson } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiJson('/accounts/register', 'POST', form)
      await refresh()
      router.push('/face-upload')
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-14">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register your account, then enroll your biometric profile.
          </p>
        </div>

        <Panel>
          <form
            action="javascript:void(0);"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <Field label="Username" htmlFor="username">
              <TextInput
                id="username"
                name="username"
                required
                minLength={1}
                maxLength={30}
                autoComplete="username"
                placeholder="agent_handle"
                value={form.username}
                onChange={update('username')}
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <TextInput
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="agent@visioncross.io"
                value={form.email}
                onChange={update('email')}
              />
            </Field>
            <Field label="Password" htmlFor="password" hint="6–30 characters">
              <TextInput
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                maxLength={30}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
              />
            </Field>

            <FormMessage type="error">{error}</FormMessage>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
            >
              {loading ? <Spinner /> : <UserPlus className="size-4" />}
              {loading ? 'Creating account…' : 'Register & Continue'}
            </button>
          </form>
        </Panel>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  )
}
