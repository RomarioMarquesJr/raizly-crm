'use client'

import { useState, useRef } from 'react'
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getResetPasswordRedirectUrl } from '@/utils/url'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const emailRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email.trim()) {
            emailRef.current?.focus()
            return
        }

        setIsSending(true)

        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getResetPasswordRedirectUrl(),
        })

        // Always show success — never reveal whether the email exists
        setIsSending(false)
        setIsSent(true)
    }

    return (
        <AuthCard
            title="Recuperar senha"
            description="Informe seu e-mail e enviaremos um link para redefinir sua senha."
        >
            {isSent ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                        <div className="flex justify-center mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                <Send className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-emerald-800">
                            Link enviado!
                        </p>
                        <p className="mt-1.5 text-xs text-emerald-600 leading-relaxed">
                            Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
                            Verifique também a pasta de spam.
                        </p>
                    </div>

                    <Link
                        href="/login"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para o login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        disabled={isSending}
                    />

                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSending}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar link de recuperação
                                </>
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para o login
                        </Link>
                    </div>
                </form>
            )}
        </AuthCard>
    )
}
