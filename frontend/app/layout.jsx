import { Analytics } from '@vercel/analytics/next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/toast-provider'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata = {
  title: 'VisionCross — Biometric Clearance Network',
  description:
    'A secure, clearance-level content-sharing platform authenticated by a custom Siamese face-recognition network.',
  generator: 'v0.app',
}

export const viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0e1a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrains.variable} bg-background`}>
      <body className="font-mono antialiased">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
