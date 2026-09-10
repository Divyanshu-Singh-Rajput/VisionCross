'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Inbox, RefreshCw } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'
import { RequireAuth } from '@/components/require-auth'
import { PostCard, PostCardSkeleton } from '@/components/post-card'
import { CreatePostModal } from '@/components/create-post-modal'
import { VerificationModal } from '@/components/verification-modal'
import { FormMessage } from '@/components/form'
import { apiGet } from '@/lib/api'

export default function FeedPage() {
  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <RequireAuth>
          <Feed />
        </RequireAuth>
      </main>
    </div>
  )
}

async function fetchPosts() {
  const data = await apiGet('/posts/')
  return data.posts ?? []
}

function Feed() {
  const { data, error, isLoading, mutate } = useSWR('/posts/', fetchPosts, {
    revalidateOnFocus: false,
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [verifyOpen, setVerifyOpen] = useState(false)

  function onView(post) {
    setActive(post)
    setVerifyOpen(true)
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Feed</h1>
          <p className="mt-1 text-xs tracking-[0.15em] text-muted-foreground uppercase">
            SECURE CONTENT &bull; CLEARANCE-BASED ACCESS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mutate()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="size-3.5" /> Create Post
          </button>
        </div>
      </div>

      {error && (
        <FormMessage type="error">
          Could not load the feed. Ensure the backend is reachable, then refresh.
        </FormMessage>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((post) => (
            <PostCard key={post._id} post={post} onView={onView} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
              <Inbox className="size-7" />
            </div>
            <p className="font-display text-lg font-semibold">No posts available</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              There is no classified content at your clearance level yet. Be the first to publish
              intel.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <Plus className="size-4" /> Create Post
            </button>
          </div>
        )
      )}

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => mutate()}
      />
      <VerificationModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        postId={active?._id ?? null}
        caption={active?.caption}
      />
    </>
  )
}
