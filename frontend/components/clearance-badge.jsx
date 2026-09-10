import { Lock } from 'lucide-react'
import { clearanceMeta } from '@/lib/clearance'
import { cn } from '@/lib/utils'

const TOKEN_CLASSES = {
  'clr-0': 'text-clr-0 border-clr-0/40 bg-clr-0/10',
  'clr-1': 'text-clr-1 border-clr-1/40 bg-clr-1/10',
  'clr-2': 'text-clr-2 border-clr-2/40 bg-clr-2/10',
  'clr-3': 'text-clr-3 border-clr-3/40 bg-clr-3/10',
  'clr-4': 'text-clr-4 border-clr-4/40 bg-clr-4/10',
}

export function ClearanceBadge({
  level,
  showLock = false,
  className,
}) {
  const meta = clearanceMeta(level)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.18em] uppercase',
        TOKEN_CLASSES[meta.token] ?? 'text-muted-foreground border-border bg-muted',
        className,
      )}
    >
      {showLock && <Lock className="size-3" />}
      L{level} · {meta.label}
    </span>
  )
}
