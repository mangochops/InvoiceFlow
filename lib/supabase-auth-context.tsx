'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  session: Session | null
  user: SupabaseUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string; needsVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not initialized. Please check your environment variables.')
      setLoading(false)
      return
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not initialized' }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) return { error: error.message }

      if (!data.session) {
        return { needsVerification: true }
      }

      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not initialized' }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { error: error.message }
      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}