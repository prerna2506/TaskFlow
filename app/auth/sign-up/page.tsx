"use client"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      router.push('/auth/sign-up-success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-md px-6">

        <div className="text-center mb-8">
          <LayoutDashboard className="mx-auto h-10 w-10 text-white" />
          <h1 className="text-2xl font-bold text-white mt-2">Create account</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

          <form onSubmit={handleSignUp} className="space-y-4">

            <div>
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-600"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-600"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Confirm Password</Label>
              <Input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-600"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create account"}
            </Button>

          </form>

          <p className="text-sm text-zinc-400 text-center mt-4">
            Already have an account? <Link href="/auth/login" className="text-white">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  )
}