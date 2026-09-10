'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import { SiteBackground } from '@/components/site-background'
import { Panel } from '@/components/form'

export default function ErrorBoundary({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('[v0] Unhandled route error:', error)
  }, [error])

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <SiteBackground />
      <Panel className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-danger/30 bg-danger/10">
          <AlertTriangle className="size-6 text-danger" />
        </div>
        <p className="font-display text-xs font-semibold tracking-[0.3em] text-danger">
          SYSTEM FAULT
        </p>
        <h1 className="mt-2 font-display text-xl font-bold tracking-wide text-foreground">
          Transmission Interrupted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          An unexpected error broke the secure channel. This has been logged.
          You can retry the operation or return to base.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <RotateCw className="size-4" /> Retry
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Home className="size-4" /> Home Base
          </Link>
        </div>
      </Panel>
    </main>
  )
}
