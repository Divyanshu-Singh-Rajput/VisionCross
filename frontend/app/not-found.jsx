import Link from 'next/link'
import { ScanFace, LayoutGrid, Home } from 'lucide-react'
import { SiteBackground } from '@/components/site-background'
import { Panel } from '@/components/form'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <SiteBackground />
      <Panel className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <ScanFace className="size-6 text-primary" />
        </div>
        <p className="font-display text-xs font-semibold tracking-[0.3em] text-primary">
          ERROR 404
        </p>
        <h1 className="mt-2 font-display text-xl font-bold tracking-wide text-foreground">
          Sector Not Found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This route is outside the VisionCross clearance grid. It may have been
          decommissioned, or the coordinates are invalid.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/feed"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <LayoutGrid className="size-4" /> Go to Feed
          </Link>
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
