'use client'

import { useState } from 'react'
import { FilePlus2, Send } from 'lucide-react'
import { Modal } from '@/components/modal'
import { Field, TextInput, TextArea, Select, FormMessage } from '@/components/form'
import { Spinner } from '@/components/spinner'
import { apiJson } from '@/lib/api'
import { POST_CLEARANCE_OPTIONS } from '@/lib/clearance'

export function CreatePostModal({
  open,
  onClose,
  onCreated,
}) {
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [clearance, setClearance] = useState('1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setCaption('')
    setLink('')
    setClearance('1')
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiJson('/posts/create-post', 'POST', {
        caption,
        link,
        clearance_level: Number(clearance),
      })
      setLoading(false)
      reset()
      onCreated()
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to create post.')
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish Post"
      icon={<FilePlus2 className="size-4 text-primary" />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Caption" htmlFor="caption">
          <TextArea
            id="caption"
            required
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Field>
        <Field label="Destination Link" htmlFor="link" hint="Must be a valid http(s) URL">
          <TextInput
            id="link"
            type="url"
            required
            placeholder="https://classified.example/document"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </Field>
        <Field
          label="Required Clearance"
          htmlFor="clearance"
          hint="Lower level = higher secrecy. Only users at or above this clearance can view."
        >
          <Select
            id="clearance"
            value={clearance}
            onChange={(e) => setClearance(e.target.value)}
          >
            {POST_CLEARANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Level {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <FormMessage type="error">{error}</FormMessage>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {loading ? <Spinner /> : <Send className="size-4" />}
          {loading ? 'Publishing…' : 'Publish Post'}
        </button>
      </form>
    </Modal>
  )
}
