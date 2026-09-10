'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound, ScanFace, LogIn } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'
import { CameraCapture } from '@/components/camera-capture'
import { Panel, Field, TextInput, FormMessage } from '@/components/form'
import { Spinner } from '@/components/spinner'
import { apiJson, apiForm } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, refresh } = useAuth()
  const [tab, setTab] = useState('password')

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (user && !user.embedding_status) {
        router.replace('/face-upload')
      } else {
        router.replace('/feed')
      }
    }
  }, [isLoading, isLoggedIn, user, router])

  async function afterLogin() {
    const updated = await refresh()
    if (updated && !updated.embedding_status) {
      router.push('/face-upload')
    } else {
      router.push('/feed')
    }
  }

  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-14">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Log In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in with credentials or a live face scan.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/40 p-1">
          <TabButton active={tab === 'password'} onClick={() => setTab('password')}>
            <KeyRound className="size-4" /> Password
          </TabButton>
          <TabButton active={tab === 'face'} onClick={() => setTab('face')}>
            <ScanFace className="size-4" /> Face Scan
          </TabButton>
        </div>

        <Panel>
          {tab === 'password' ? (
            <PasswordForm onSuccess={afterLogin} />
          ) : (
            <FaceForm onSuccess={afterLogin} />
          )}
        </Panel>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register now
          </Link>
        </p>
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function PasswordForm({ onSuccess }) {
  const { showToast } = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const isEmail = identifier.includes('@')
    try {
      await apiJson('/accounts/login', 'POST', {
        [isEmail ? 'email' : 'username']: identifier,
        password,
      })
      await onSuccess()
    } catch (err) {
      const message = err?.message || 'Invalid credentials'
      setError(message)
      showToast(message)
      setLoading(false)
    }
  }

  return (
    <form
      action="javascript:void(0);"
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <Field label="Username or Email" htmlFor="identifier">
        <TextInput
          id="identifier"
          name="identifier"
          required
          autoComplete="username"
          placeholder="agent_handle or agent@visioncross.io"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <FormMessage type="error">{error}</FormMessage>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
      >
        {loading ? <Spinner /> : <LogIn className="size-4" />}
        {loading ? 'Authenticating…' : 'Log In'}
      </button>
    </form>
  )
}

function FaceForm({ onSuccess }) {
  const { showToast } = useToast()
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Capture or upload a photo first.')
      return
    }
    setError('')
    setScore(null)
    setLoading(true)
    const fd = new FormData()
    fd.append('photos', file)
    try {
      const res = await apiForm(
        '/accounts/login/facescan',
        fd,
      )
      setScore(res.similarity_score ?? null)
      // Brief pause so the confidence read-out is visible before redirect.
      setTimeout(() => onSuccess(), 900)
    } catch (err) {
      const message =
        err?.status === 401
          ? 'Face not recognized. Try again or use your password.'
          : err?.message || 'Face login failed.'
      setError(message)
      showToast(message)
      setLoading(false)
    }
  }

  return (
    <form
      action="javascript:void(0);"
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <CameraCapture onFileReady={setFile} disabled={loading} />

      {score !== null && (
        <FormMessage type="success">
          Match confirmed · confidence {(score * 100).toFixed(1)}%
        </FormMessage>
      )}
      <FormMessage type="error">{error}</FormMessage>

      <button
        type="submit"
        disabled={loading || !file}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
      >
        {loading ? <Spinner /> : <ScanFace className="size-4" />}
        {loading ? 'Running inference…' : 'Scan & Log In'}
      </button>
    </form>
  )
}
