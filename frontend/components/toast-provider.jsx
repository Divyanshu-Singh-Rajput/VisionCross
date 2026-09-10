'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, tone = 'error') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, tone, message }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-96" aria-live="polite">
        {toasts.map((toast) => {
          const isError = toast.tone === 'error'
          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-fade-up',
                isError ? 'border-danger/50 bg-[#25141d]/95 text-danger' : 'border-success/50 bg-[#12251f]/95 text-success',
              )}
            >
              {isError ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
              <span className="min-w-0 flex-1 leading-relaxed">{toast.message}</span>
              <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function useToastError(message) {
  const { showToast } = useToast()
  useEffect(() => {
    if (message) showToast(message)
  }, [message, showToast])
}
