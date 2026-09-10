'use client'

import { useState } from 'react'
import { ShieldCheck, ScanFace, KeyRound, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/modal'
import { CameraCapture } from '@/components/camera-capture'
import { Field, TextInput, FormMessage } from '@/components/form'
import { Spinner } from '@/components/spinner'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'

export function VerificationModal({
  open,
  onClose,
  postId,
  caption,
}) {
  const { showToast } = useToast()
  const [tab, setTab] = useState('face')
  const [file, setFile] = useState(null)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function close() {
    setFile(null)
    setIdentifier('')
    setPassword('')
    setError('')
    setLoading(false)
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!postId) {
      const msg = 'Missing post identifier.'
      setError(msg)
      showToast(msg, 'error')
      return
    }

    if (tab === 'face' && !file) {
      const msg = 'Capture or upload a photo to verify.'
      setError(msg)
      showToast(msg, 'error')
      return
    }

    if (tab === 'password' && (!identifier || !password)) {
      const msg = 'Enter your credentials to verify.'
      setError(msg)
      showToast(msg, 'error')
      return
    }

    // Open a blank tab synchronously to avoid popup blockers when redirecting
    let newTab = null
    try {
      newTab = window.open('about:blank', '_blank')
      if (newTab) {
        newTab.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>VisionCross — Verifying Clearance</title></head>
            <body style="margin:0;background:#0a0e1a;color:#00d4ff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;">
              <p style="font-size:14px;letter-spacing:0.15em">AUTHENTICATING CLEARANCE...</p>
            </body>
          </html>
        `)
      }
    } catch {
      // Browser popup blocked
    }

    setLoading(true)

    const fd = new FormData()
    fd.append('post_id', postId)
    fd.append('verification_method', tab === 'face' ? 'face-scan' : 'credential')

    if (tab === 'face') {
      fd.append('photos', file)
    } else {
      fd.append('username', identifier)
      fd.append('email', identifier)
      fd.append('password', password)
    }

    try {
      const res = await fetch('/api/posts/verification', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.post_link) {
        if (newTab && !newTab.closed) {
          newTab.location.href = data.post_link
        } else {
          window.open(data.post_link, '_blank', 'noopener,noreferrer')
        }
        showToast('Clearance verified. Destination link opened.', 'success')
        close()
      } else {
        // Verification failed - close the blank tab so no raw JSON pretty-print is shown
        if (newTab && !newTab.closed) {
          newTab.close()
        }
        const message = data.message || 'Verification failed. Credentials or face did not match.'
        setError(message)
        showToast(message, 'error')
      }
    } catch (err) {
      if (newTab && !newTab.closed) {
        newTab.close()
      }
      const message = err?.message || 'Verification request failed. Please try again.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Step-Up Verification"
      icon={<ShieldCheck className="size-4 text-primary" />}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Re-verify your identity to unlock{' '}
        <span className="text-foreground">
          {caption ? `"${caption}"` : 'this classified content'}
        </span>
        .
      </p>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/40 p-1">
        <TabButton active={tab === 'face'} onClick={() => { setTab('face'); setError(''); }}>
          <ScanFace className="size-4" /> Face Scan
        </TabButton>
        <TabButton active={tab === 'password'} onClick={() => { setTab('password'); setError(''); }}>
          <KeyRound className="size-4" /> Password
        </TabButton>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === 'face' ? (
          <CameraCapture onFileReady={setFile} disabled={loading} />
        ) : (
          <>
            <Field label="Username or Email" htmlFor="v-id">
              <TextInput
                key="v-identifier-input"
                id="v-id"
                name="identifier"
                required
                placeholder="agent_handle or agent@visioncross.io"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </Field>
            <Field label="Password" htmlFor="v-pw">
              <TextInput
                key="v-password-input"
                id="v-pw"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Field>
          </>
        )}

        <FormMessage type="error">{error}</FormMessage>

        <button
          type="submit"
          disabled={loading || (tab === 'face' ? !file : !identifier || !password)}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {loading ? <Spinner /> : <ExternalLink className="size-4" />}
          {loading ? 'Authenticating…' : 'Verify & Open Link'}
        </button>
      </form>
    </Modal>
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
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
