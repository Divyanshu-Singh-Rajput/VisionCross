'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '@/components/modal'
import { Spinner } from '@/components/spinner'

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      icon={
        destructive ? (
          <div className="flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </div>
        ) : (
          <div className="flex size-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <AlertTriangle className="size-4" />
          </div>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This operation is permanent and cannot be reversed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-semibold tracking-wide text-foreground transition-colors hover:bg-secondary/70 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? 'flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold tracking-wide text-destructive-foreground transition-colors hover:bg-destructive/85 disabled:opacity-50'
                : 'flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50'
            }
          >
            {loading ? <Spinner /> : <Trash2 className="size-3.5" />}
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
