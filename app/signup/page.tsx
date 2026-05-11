'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/lib/supabase-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Header from '@/components/header'
import { Mail, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const { signUp } = useSupabaseAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signUp(email, password)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.needsVerification) {
        setVerificationSent(true)
      } else {
        // Auto-signed in (email confirmation disabled)
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show verification confirmation screen
  if (verificationSent) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <Card className="w-full max-w-md p-8">
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Click the link in your email</p>
                    <p className="text-muted-foreground">
                      This confirms your account and lets you sign in
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Check your spam folder</p>
                    <p className="text-muted-foreground">
                      If you don't see it, it might be hiding there
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Go to Sign In
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setVerificationSent(false)
                    setEmail('')
                    setPassword('')
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Use a different email
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Original signup form
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Start processing invoices in minutes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}