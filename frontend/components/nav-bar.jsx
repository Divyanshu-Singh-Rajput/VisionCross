'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, ChevronDown, ShieldAlert, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

function NavLink({
  href,
  active,
  children,
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium tracking-wide transition-colors sm:px-3',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      {children}
    </Link>
  )
}

export function NavBar() {
  const { user, isLoggedIn, logout } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const isAdmin = user?.clearance_level === 0

  useEffect(() => {
    if (!menuOpen) return
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0a0e1a]/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={isLoggedIn ? '/feed' : '/'}
          className="flex shrink-0 items-center gap-2 overflow-hidden"
        >
          <span className="truncate font-display text-base font-bold tracking-[0.18em] text-foreground sm:text-lg">
            VISION<span className="relative top-0.5 text-accent text-2xl leading-none sm:top-1 sm:text-3xl">X</span>
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1">
          {isLoggedIn ? (
            <>
              <NavLink href="/feed" active={pathname === '/feed'}>
                <LayoutGrid className="size-3.5" /> Feed
              </NavLink>

              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary sm:px-3"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-success" />
                  <span className="max-w-[4.5rem] truncate sm:max-w-[9rem]">
                    {user?.username}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3 shrink-0 transition-transform',
                      menuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-[#0d1424] shadow-2xl animate-fade-up"
                  >
                    <div className="border-b border-border bg-[#090d18] px-3.5 py-3">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {user?.username}
                      </p>
                      <p className="truncate text-[0.7rem] text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <ShieldAlert className="size-3.5" /> Command Console
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 border-t border-border bg-[#0d1424] px-3.5 py-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-3.5" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink href="/login" active={pathname === '/login'}>
                Login
              </NavLink>
              <Link
                href="/register"
                className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85 sm:px-3"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
