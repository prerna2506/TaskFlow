"use client"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in both email and password.')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      // ✅ FIXED LOGIN (no invalid options)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message, {
          description: 'Please check your credentials and try again.'
        })
        setIsLoading(false)
        return
      }

      toast.success('Successfully logged in!', {
        description: 'Redirecting you to your workspace...'
      })

      router.push('/dashboard')

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An error occurred'
      toast.error('Login Failed', { description: msg })
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0B] selection:bg-primary/30">

      {/* Background */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-[120px] -z-10" />
      <div className="absolute bottom-0 -right-1/4 w-[150%] h-full bg-gradient-to-tl from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] -z-10" />

      <div className="w-full max-w-md px-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-zinc-400">Enter your credentials</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            New user?{' '}
            <Link href="/auth/sign-up" className="text-white">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}