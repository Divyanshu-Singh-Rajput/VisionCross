'use client'

import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { apiGet, apiJson } from '@/lib/api'

const AuthContext = createContext(null)

async function fetchInfo() {
  const data = await apiGet('/accounts/info')
  return {
    username: data.username,
    email: data.email,
    embedding_status: data.embedding_status,
    clearance_level: data.clearance_level,
  }
}

export function AuthProvider({ children }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR('/accounts/info', fetchInfo, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  })

  async function logout() {
    try {
      await apiJson('/accounts/logout', 'POST')
    } catch {
      // Proceed even if network fails
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; Max-Age=0; path=/;'
    }
    await mutate(null, false)
    window.location.href = '/login'
  }

  const value = {
    user: data ?? null,
    isLoading,
    isValidating,
    isLoggedIn: !!data,
    error,
    refresh: () => mutate(),
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
