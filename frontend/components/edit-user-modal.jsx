'use client'

import { useEffect, useState } from 'react'
import { UserCog, Save } from 'lucide-react'
import { Modal } from '@/components/modal'
import { Field, TextInput, Select, FormMessage } from '@/components/form'
import { Spinner } from '@/components/spinner'
import { apiJson } from '@/lib/api'

export function EditUserModal({
  user,
  onClose,
  onSaved,
}) {
  const [username, setUsername] = useState('')
  const [clearance, setClearance] = useState('1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      // Admins (level 0) are not selectable in the 1-4 range; default to 1.
      setClearance(String(user.clearance_level >= 1 ? user.clearance_level : 1))
      setError('')
    }
  }, [user])

  async function onSubmit(e) {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    try {
      await apiJson('/admin/users/update', 'PATCH', {
        user_id: user._id,
        updates: { username, clearance_level: Number(clearance) },
      })
      setLoading(false)
      onSaved()
      onClose()
    } catch (err) {
      setError(err?.message || 'Update failed.')
      setLoading(false)
    }
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Edit User"
      icon={<UserCog className="size-4 text-accent" />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Username" htmlFor="edit-username">
          <TextInput
            id="edit-username"
            required
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Clearance Level" htmlFor="edit-clearance" hint="Integer 1–4">
          <Select
            id="edit-clearance"
            value={clearance}
            onChange={(e) => setClearance(e.target.value)}
          >
            <option value="1">1 — Top Secret</option>
            <option value="2">2 — Secret</option>
            <option value="3">3 — Confidential</option>
            <option value="4">4 — Restricted</option>
          </Select>
        </Field>

        <FormMessage type="error">{error}</FormMessage>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {loading ? <Spinner /> : <Save className="size-4" />}
          Save Changes
        </button>
      </form>
    </Modal>
  )
}
