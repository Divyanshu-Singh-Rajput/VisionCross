export const CLEARANCE = {
  0: { label: 'Admin', token: 'clr-0' },
  1: { label: 'Top Secret', token: 'clr-1' },
  2: { label: 'Secret', token: 'clr-2' },
  3: { label: 'Confidential', token: 'clr-3' },
  4: { label: 'Restricted', token: 'clr-4' },
}

export function clearanceMeta(level) {
  return CLEARANCE[level] ?? { label: `Level ${level}`, token: 'muted-foreground' }
}

export const POST_CLEARANCE_OPTIONS = [1, 2, 3, 4].map((v) => ({
  value: v,
  label: `${v} — ${CLEARANCE[v].label}`,
}))
