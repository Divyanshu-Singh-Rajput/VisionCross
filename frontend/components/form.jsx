import { forwardRef } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Panel({
  className,
  children,
}) {
  return (
    <div
      className={cn(
        'glass rounded-xl border border-border p-6 shadow-[0_0_40px_-20px_rgba(0,212,255,0.5)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[0.7rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const inputStyles =
  'w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50'

export const TextInput = forwardRef(function TextInput({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputStyles, className)} {...props} />
})

export const TextArea = forwardRef(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputStyles, 'min-h-24 resize-y', className)}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(inputStyles, 'appearance-none', className)} {...props}>
      {children}
    </select>
  )
})

export function FormMessage({
  type,
  children,
}) {
  if (!children) return null
  const isError = type === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
        isError
          ? 'border-danger/40 bg-danger/10 text-danger'
          : 'border-success/40 bg-success/10 text-success',
      )}
    >
      {isError ? (
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  )
}
