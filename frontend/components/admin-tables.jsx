'use client'

import { Pencil, Trash2, CircleCheck, CircleSlash } from 'lucide-react'
import { ClearanceBadge } from '@/components/clearance-badge'

export function UsersTable({
  users,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border glass">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[0.7rem] tracking-[0.15em] text-muted-foreground uppercase">
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Enrolled</th>
            <th className="px-4 py-3 font-semibold">Clearance</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
              <td className="px-4 py-3 font-medium text-foreground">{u.username}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                {u.embedding_status ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-success">
                    <CircleCheck className="size-3.5" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleSlash className="size-3.5" /> No
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <ClearanceBadge level={u.clearance_level} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(u)}
                    className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label={`Edit ${u.username}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u)}
                    className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger"
                    aria-label={`Delete ${u.username}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PostsTable({
  posts,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border glass">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[0.7rem] tracking-[0.15em] text-muted-foreground uppercase">
            <th className="px-4 py-3 font-semibold">Author</th>
            <th className="px-4 py-3 font-semibold">Caption</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p._id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
              <td className="px-4 py-3 font-medium text-foreground">{p.username}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{p.caption}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString(undefined, {
                  dateStyle: 'medium',
                }) || p.created_at}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDelete(p)}
                    className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger"
                    aria-label="Delete post"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
