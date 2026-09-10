'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Shield, Users, FileText, ShieldAlert, Loader2 } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'
import { RequireAuth } from '@/components/require-auth'
import { UsersTable, PostsTable } from '@/components/admin-tables'
import { EditUserModal } from '@/components/edit-user-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { FormMessage } from '@/components/form'
import { apiGet, apiJson } from '@/lib/api'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

export default function AdminPage() {
  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <RequireAuth>
          <AdminDashboard />
        </RequireAuth>
      </main>
    </div>
  )
}

async function fetchUsers() {
  const data = await apiGet('/admin/users')
  return data.users_list ?? []
}
async function fetchPosts() {
  const data = await apiGet('/posts/')
  return data.posts ?? []
}

function AdminDashboard() {
  const { showToast } = useToast()
  const [section, setSection] = useState('users')
  const [editing, setEditing] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  const usersSwr = useSWR('/admin/users', fetchUsers, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  const postsSwr = useSWR('/admin/posts', fetchPosts, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const forbidden =
    usersSwr.error?.status === 403 ||
    usersSwr.error?.status === 401

  function deleteUser(u) {
    setConfirmTarget({
      type: 'user',
      data: u,
      title: 'Delete User',
      description: `Delete user "${u.username}" (${u.email})? This action cannot be undone.`,
    })
  }

  function deletePost(p) {
    setConfirmTarget({
      type: 'post',
      data: p,
      title: 'Delete Post',
      description: `Delete post by "${p.username}"${p.caption ? ` ("${p.caption}")` : ''}?`,
    })
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return
    setActionError('')
    setDeleting(true)
    try {
      if (confirmTarget.type === 'user') {
        await apiJson('/admin/users/update', 'DELETE', { user_id: confirmTarget.data._id })
        usersSwr.mutate()
        showToast(`User "${confirmTarget.data.username}" deleted successfully.`, 'success')
      } else {
        await apiJson('/admin/posts/delete', 'DELETE', { post_id: confirmTarget.data._id })
        postsSwr.mutate()
        showToast(`Post by "${confirmTarget.data.username}" deleted successfully.`, 'success')
      }
      setConfirmTarget(null)
    } catch (err) {
      const msg = err?.message || 'Operation failed.'
      setActionError(msg)
      showToast(msg, 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-danger/40 py-20 text-center">
        <div className="inline-flex size-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
          <ShieldAlert className="size-7" />
        </div>
        <p className="font-display text-lg font-semibold">Access Denied</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This console requires Level 0 (Admin) clearance. Your account is not authorized to view
          it.
        </p>
      </div>
    )
  }

  const loading = usersSwr.isLoading || postsSwr.isLoading

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
          <Shield className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Manage users and classified posts.</p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-secondary/40 p-1 sm:w-fit">
        <TabButton active={section === 'users'} onClick={() => setSection('users')}>
          <Users className="size-4" /> Users ({usersSwr.data?.length ?? 0})
        </TabButton>
        <TabButton active={section === 'posts'} onClick={() => setSection('posts')}>
          <FileText className="size-4" /> Posts ({postsSwr.data?.length ?? 0})
        </TabButton>
      </div>

      {actionError && <FormMessage type="error">{actionError}</FormMessage>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Loading records…
        </div>
      ) : section === 'users' ? (
        <UsersTable users={usersSwr.data ?? []} onEdit={setEditing} onDelete={deleteUser} />
      ) : (
        <PostsTable posts={postsSwr.data ?? []} onDelete={deletePost} />
      )}

      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => usersSwr.mutate()}
      />

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title={confirmTarget?.title}
        description={confirmTarget?.description}
        confirmText="Confirm Delete"
        loading={deleting}
      />
    </>
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
        'flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
