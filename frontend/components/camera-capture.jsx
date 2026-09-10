'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Upload, VideoOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CameraCapture({ onFileReady, disabled }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [camError, setCamError] = useState(null)
  const [ready, setReady] = useState(false)

  const stopStream = useCallback(() => {
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
      setCamError('Camera unavailable. Use the file upload option below.')
      setReady(false)
    }
  }, [])

  useEffect(() => {
    startStream()
    return () => stopStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })
        setPreview(URL.createObjectURL(blob))
        onFileReady(file)
        stopStream()
      },
      'image/jpeg',
      0.92,
    )
  }, [onFileReady, stopStream])

  const retake = useCallback(() => {
    setPreview(null)
    onFileReady(null)
    startStream()
  }, [onFileReady, startStream])

  const onFilePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onFileReady(file)
    stopStream()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-primary/30 bg-black neon-border">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Captured face" className="size-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="size-full scale-x-[-1] object-cover"
            />
            {ready && (
              <>
                <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_18px_4px_rgba(0,212,255,0.7)] animate-scanline" />
                <div className="absolute inset-6 rounded-lg border border-primary/40" />
                <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                  ● Live Scan
                </span>
              </>
            )}
            {!ready && !camError && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                Initializing camera…
              </div>
            )}
            {camError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
                <VideoOff className="size-6 text-danger" />
                {camError}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {preview ? (
          <button
            type="button"
            onClick={retake}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70 disabled:opacity-50"
          >
            <RefreshCw className="size-4" /> Retake
          </button>
        ) : (
          <button
            type="button"
            onClick={capture}
            disabled={disabled || !ready}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50',
              ready && 'animate-pulse-ring',
            )}
          >
            <Camera className="size-4" /> Capture
          </button>
        )}

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70">
          <Upload className="size-4" />
          <span className="hidden sm:inline">File</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/bmp"
            className="sr-only"
            onChange={onFilePick}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  )
}
