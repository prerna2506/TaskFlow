"use client"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // 👈 NEW
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      router.push('/dashboard')

    } catch (error: unknown) {
      toast.error('Login Failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-md px-6">

        <div className="text-center mb-8">
          <LayoutDashboard className="mx-auto h-10 w-10 text-white" />
          <h1 className="text-2xl font-bold text-white mt-2">Welcome back</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div>
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-600 placeholder:text-zinc-400"
              />
            </div>

            {/* PASSWORD WITH EYE */}
            <div className="relative">
              <Label className="text-zinc-300">Password</Label>

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-600 placeholder:text-zinc-400 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-zinc-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* BUTTON */}
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>

          </form>

          <p className="text-sm text-zinc-400 text-center mt-4">
            New user? <Link href="/auth/sign-up" className="text-white">Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  )
}