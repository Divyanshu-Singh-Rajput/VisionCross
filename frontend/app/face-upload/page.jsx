'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanFace, Camera, Upload, Check, Loader2, VideoOff } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'
import { Panel, FormMessage } from '@/components/form'
import { RequireAuth } from '@/components/require-auth'
import { apiForm } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const REQUIRED = 100

export default function FaceUploadPage() {
  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <RequireAuth requireEnrolled={false}>
          <Enrollment />
        </RequireAuth>
      </main>
    </div>
  )
}

function Enrollment() {
  const router = useRouter()
  const { refresh } = useAuth()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const captureLoop = useRef(null)

  const [frames, setFrames] = useState([])
  const [capturing, setCapturing] = useState(false)
  const [ready, setReady] = useState(false)
  const [camError, setCamError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const stopStream = useCallback(() => {
    if (captureLoop.current) window.clearInterval(captureLoop.current)
    captureLoop.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  const startStream = useCallback(async () => {
    setCamError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setReady(true)
    } catch {
      setCamError('Camera unavailable — use the file upload option instead.')
    }
  }, [])

  useEffect(() => {
    startStream()
    return () => stopStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grabFrame = useCallback(() => {
    return new Promise((resolve) => {
      const video = videoRef.current
      if (!video || !video.videoWidth) return resolve(null)
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(null)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) =>
          resolve(
            blob
              ? new File([blob], `frame-${Date.now()}-${Math.random()}.jpg`, {
                  type: 'image/jpeg',
                })
              : null,
          ),
        'image/jpeg',
        0.9,
      )
    })
  }, [])

  const startCapture = useCallback(() => {
    if (!ready) return
    setFrames([])
    setError('')
    setCapturing(true)
    captureLoop.current = window.setInterval(async () => {
      const frame = await grabFrame()
      setFrames((prev) => {
        if (prev.length >= REQUIRED) return prev
        const next = frame ? [...prev, frame] : prev
        if (next.length >= REQUIRED && captureLoop.current) {
          window.clearInterval(captureLoop.current)
          captureLoop.current = null
          setCapturing(false)
        }
        return next
      })
    }, 120)
  }, [ready, grabFrame])

  const onFilePick = (e) => {
    const picked = Array.from(e.target.files ?? [])
    setError('')
    setFrames(picked.slice(0, REQUIRED))
  }

  async function upload() {
    if (frames.length !== REQUIRED) {
      setError(`Exactly ${REQUIRED} photos are required. You have ${frames.length}.`)
      return
    }
    setError('')
    setUploading(true)
    stopStream()
    const fd = new FormData()
    frames.forEach((f) => fd.append('photos', f))
    try {
      await apiForm('/accounts/upload', fd)
      setDone(true)
      refresh()
      setTimeout(() => router.push('/feed'), 1400)
    } catch (err) {
      setError(
        err?.status === 409
          ? 'Your biometric profile is already enrolled.'
          : err?.message || 'Upload failed. Please try again.',
      )
      setUploading(false)
      startStream()
    }
  }

  const pct = Math.round((frames.length / REQUIRED) * 100)

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <ScanFace className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Biometric Enrollment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture exactly {REQUIRED} face frames to train your Siamese profile. Move your head
          slowly for varied angles. This is a one-time step.
        </p>
      </div>

      <Panel>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
              <Check className="size-7" />
            </div>
            <p className="font-display text-lg font-semibold">Profile Enrolled</p>
            <p className="text-sm text-muted-foreground">Redirecting to your feed…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border border-primary/30 bg-black neon-border">
              <video
                ref={videoRef}
                playsInline
                muted
                className="size-full scale-x-[-1] object-cover"
              />
              {ready && (capturing || frames.length === 0) && (
                <>
                  <div className="absolute inset-x-0 h-0.5 animate-scanline bg-primary shadow-[0_0_18px_4px_rgba(0,212,255,0.7)]" />
                  <div className="absolute inset-6 rounded-lg border border-primary/40" />
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-primary">
                  <Loader2 className="size-8 animate-spin" />
                  <p className="text-xs tracking-[0.2em] uppercase">Training model…</p>
                </div>
              )}
              {camError && !uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
                  <VideoOff className="size-6 text-danger" />
                  {camError}
                </div>
              )}
              <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-primary">
                {frames.length} / {REQUIRED}
              </span>
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{capturing ? 'Capturing frames…' : uploading ? 'Uploading' : 'Progress'}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-200',
                    uploading && 'shimmer relative',
                  )}
                  style={{ width: `${uploading ? 100 : pct}%` }}
                />
              </div>
              {uploading && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Neural inference can take 30–120 seconds. Keep this tab open.
                </p>
              )}
            </div>

            <FormMessage type="error">{error}</FormMessage>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={startCapture}
                disabled={!ready || capturing || uploading}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50',
                  ready && !capturing && frames.length === 0 && 'animate-pulse-ring',
                )}
              >
                <Camera className="size-4" />
                {capturing ? 'Capturing…' : frames.length ? 'Recapture' : 'Auto-Capture 100'}
              </button>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70">
                <Upload className="size-4" /> Upload files
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/bmp"
                  multiple
                  className="sr-only"
                  onChange={onFilePick}
                  disabled={uploading}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={upload}
              disabled={frames.length !== REQUIRED || uploading}
              className="flex items-center justify-center gap-2 rounded-lg border border-success/40 bg-success/15 px-4 py-2.5 text-sm font-semibold text-success transition-colors hover:bg-success/25 disabled:opacity-40"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Submit {REQUIRED} Photos
            </button>
          </div>
        )}
      </Panel>
    </>
  )
}
