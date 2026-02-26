'use client'

import { useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Mail, Lock, Loader2, ArrowRight, UserPlus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import Link from 'next/link'

/** Map raw Supabase errors to friendly Portuguese messages */
function friendlyError(raw: string): string {
    const map: Record<string, string> = {
        'Invalid login credentials': 'E-mail ou senha incorretos. Tente novamente ou redefina sua senha.',
        'Email not confirmed': 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
        'User already registered': 'Este e-mail já está cadastrado. Tente fazer login.',
        'Signup requires a valid password': 'Informe uma senha válida com pelo menos 6 caracteres.',
        'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    }
    return map[raw] || 'Algo deu errado. Tente novamente em alguns instantes.'
}

function LoginForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(searchParams.get('error') || '')
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setIsLoggingIn(true)

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError(friendlyError(authError.message))
            setIsLoggingIn(false)
            passwordRef.current?.focus()
            return
        }

        router.push('/onboarding')
        router.refresh()
    }

    async function handleSignup(e: React.MouseEvent) {
        e.preventDefault()
        setError('')
        setIsSigningUp(true)

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            setError(friendlyError(authError.message))
            setIsSigningUp(false)
            emailRef.current?.focus()
            return
        }

        setError('')
        router.push('/onboarding')
        router.refresh()
    }

    const isLoading = isLoggingIn || isSigningUp

    return (
        <AuthCard
            title="Bem-vindo de volta"
            description="Gerencie seus leads e feche mais negócios com inteligência."
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <AuthInput
                    ref={emailRef}
                    label="E-mail"
                    icon={Mail}
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                />

                <div>
                    <AuthInput
                        ref={passwordRef}
                        label="Senha"
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                    <div className="mt-2 text-right">
                        <Link
                            href="/login/forgot-password"
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline underline-offset-2"
                        >
                            Esqueci minha senha
                        </Link>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-2 duration-300"
                        role="alert"
                    >
                        {friendlyError(error)}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoggingIn ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Entrar
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleSignup}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSigningUp ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" />
                                Criar conta
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AuthCard>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center auth-gradient-bg">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
