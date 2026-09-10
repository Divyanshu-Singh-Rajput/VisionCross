import Link from 'next/link'
import { ScanFace, ShieldCheck, Fingerprint, Lock, Network } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'
import { SiteBackground } from '@/components/site-background'

const FEATURES = [
  {
    icon: Fingerprint,
    title: 'Siamese Biometrics',
    body: 'A custom neural network learns your face from 100 enrollment frames, then matches you against every stored embedding in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Clearance-Gated Content',
    body: 'Every post carries a classification from Top Secret to Restricted. You only ever see what your clearance level permits.',
  },
  {
    icon: Lock,
    title: 'Step-Up Verification',
    body: 'Opening a classified link demands a fresh identity check — face scan or credentials — before the destination is revealed.',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <SiteBackground />
      <NavBar />

      <main className="mx-auto w-full max-w-6xl px-4">
        <section className="flex flex-col items-center py-20 text-center md:py-28">
          <span className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-primary uppercase">
            <Network className="size-3.5" /> Biometric Clearance Network
          </span>
          <h1 className="animate-fade-up max-w-3xl text-balance font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Identity is the <span className="text-primary">key</span>. Your face is the{' '}
            <span className="text-accent">credential</span>.
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            VisionX is a classified content-sharing platform secured by an AI
            face-recognition engine and multi-tier clearance levels. Share links only
            the cleared can open.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <ScanFace className="size-4" /> Enroll Identity
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Log In
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-24 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass animate-fade-up rounded-xl border border-border p-6"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="mb-2 font-display text-base font-semibold tracking-wide">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mb-24 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: '5', l: 'Clearance Tiers' },
            { k: '100', l: 'Enrollment Frames' },
            { k: '512-D', l: 'Face Embeddings' },
            { k: 'JWT', l: 'HTTP-only Sessions' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="font-display text-2xl font-bold text-primary">{s.k}</div>
              <div className="mt-1 text-[0.7rem] tracking-[0.15em] text-muted-foreground uppercase">
                {s.l}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        VisionCross · Restricted Access System · Unauthorized use is prohibited
      </footer>
    </div>
  )
}
