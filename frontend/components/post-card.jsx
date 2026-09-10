'use client'

import { Eye, Clock, User } from 'lucide-react'

function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function PostCard({ post, onView }) {
  return (
    <article className="glass group flex flex-col justify-between rounded-xl border border-border p-5 transition-colors hover:border-primary/40">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-border bg-secondary text-primary">
              <User className="size-3.5" />
            </span>
            <span className="truncate">{post.username}</span>
          </div>
        </div>

        <p className="text-pretty text-sm leading-relaxed text-foreground/90">{post.caption}</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {formatDate(post.created_at)}
        </span>
        <button
          type="button"
          onClick={() => onView(post)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Eye className="size-3.5" /> View
        </button>
      </div>
    </article>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="glass relative overflow-hidden rounded-xl border border-border p-5">
      <div className="shimmer relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-7 w-28 rounded-full bg-secondary" />
        </div>
        <div className="mb-2 h-4 w-full rounded bg-secondary" />
        <div className="mb-5 h-4 w-3/4 rounded bg-secondary" />
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="h-4 w-32 rounded bg-secondary" />
          <div className="h-7 w-16 rounded-lg bg-secondary" />
        </div>
      </div>
    </div>
  )
}
