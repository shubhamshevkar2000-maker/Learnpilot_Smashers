"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | Error | null; user: User | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = useMemo(() => isSupabaseConfigured(), [])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    async function initSession() {
      try {
        if (!configured) {
          if (mounted) {
            setLoading(false)
          }
          return
        }

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to get initial session:", err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured, supabase])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        return {
          error: new Error(
            "Supabase is not configured yet. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          ),
        }
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return { error }
      } catch (err: any) {
        return { error: err }
      }
    },
    [configured, supabase],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!configured) {
        return {
          error: new Error(
            "Supabase is not configured yet. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          ),
          user: null,
        }
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              name: name,
            },
          },
        })
        return { error, user: data.user }
      } catch (err: any) {
        return { error: err, user: null }
      }
    },
    [configured, supabase],
  )

  const signOut = useCallback(async () => {
    try {
      if (configured) {
        await supabase.auth.signOut()
      }
      setUser(null)
      setSession(null)
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }, [configured, supabase])

  const resetPassword = useCallback(
    async (email: string) => {
      if (!configured) {
        return {
          error: new Error(
            "Supabase is not configured yet. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          ),
        }
      }

      try {
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        })
        return { error }
      } catch (err: any) {
        return { error: err }
      }
    },
    [configured, supabase],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
