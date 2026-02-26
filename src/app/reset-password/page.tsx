'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [confirmError, setConfirmError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmRef = useRef<HTMLInputElement>(null)

    // Focus the password field on mount
    useEffect(() => {
        passwordRef.current?.focus()
    }, [])

    function validate(): boolean {
        let valid = true
        setPasswordError('')
        setConfirmError('')
        setError('')

        if (password.length < 8) {
            setPasswordError('A senha deve ter pelo menos 8 caracteres.')
            passwordRef.current?.focus()
            valid = false
        }

        if (password !== confirmPassword) {
            setConfirmError('As senhas não coincidem.')
            if (valid) confirmRef.current?.focus()
            valid = false
        }

        return valid
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        setIsUpdating(true)

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        })

        if (updateError) {
            setIsUpdating(false)

            // Map common Supabase errors
            if (updateError.message.includes('should be different')) {
                setError('A nova senha deve ser diferente da senha atual.')
            } else if (updateError.message.includes('weak')) {
                setError('Essa senha é muito fraca. Use letras, números e caracteres especiais.')
            } else if (updateError.message.includes('session')) {
                setError('Sessão expirada. Solicite um novo link de recuperação.')
            } else {
                setError('Algo deu errado. Tente solicitar um novo link de recuperação.')
            }

            return
        }

        setIsSuccess(true)

        // Redirect to login after 3 seconds
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    }

    if (isSuccess) {
        return (
            <AuthCard
                title="Senha atualizada!"
                description="Sua senha foi redefinida com sucesso."
            >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-6 text-center">
                        <div className="flex justify-center mb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-emerald-800">
                            Tudo pronto!
                        </p>
                        <p className="mt-1.5 text-xs text-emerald-600">
                            Você será redirecionado para a tela de login em instantes...
                        </p>
                    </div>
                </div>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title="Redefinir senha"
            description="Escolha uma nova senha segura para sua conta."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    ref={passwordRef}
                    label="Nova senha"
                    icon={Lock}
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value)
                        setPasswordError('')
                    }}
                    error={passwordError}
                    required
                    autoComplete="new-password"
                    disabled={isUpdating}
                />

                <AuthInput
                    ref={confirmRef}
                    label="Confirmar nova senha"
                    icon={ShieldCheck}
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={e => {
                        setConfirmPassword(e.target.value)
                        setConfirmError('')
                    }}
                    error={confirmError}
                    required
                    autoComplete="new-password"
                    disabled={isUpdating}
                />

                {error && (
                    <div
                        className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-2 duration-300"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Redefinir senha'
                        )}
                    </button>
                </div>
            </form>
        </AuthCard>
    )
}
