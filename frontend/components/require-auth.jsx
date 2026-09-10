'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScanFace } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

// Guards a protected page. Redirects unauthenticated users to /login and,
// when `requireEnrolled` is set, sends users who have not enrolled their face
// to /face-upload.
export function RequireAuth({
  children,
  requireEnrolled = true,
}) {
  const { user, isLoading, isValidating, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || isValidating) return
    if (!isLoggedIn) {
      router.replace('/login')
    } else if (requireEnrolled && user && !user.embedding_status) {
      router.replace('/face-upload')
    }
  }, [isLoading, isValidating, isLoggedIn, user, requireEnrolled, router])

  if (isLoading || isValidating || !isLoggedIn || (requireEnrolled && user && !user.embedding_status)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <ScanFace className="size-7 animate-pulse text-primary" />
        <p className="text-xs tracking-[0.2em] uppercase">Verifying clearance…</p>
      </div>
    )
  }

  return <>{children}</>
}
