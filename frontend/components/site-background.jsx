export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[140px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background" />
    </div>
  )
}
