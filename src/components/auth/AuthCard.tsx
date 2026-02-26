'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AuthCardProps {
    children: React.ReactNode
    title: string
    description?: string
    className?: string
}

export function AuthCard({ children, title, description, className }: AuthCardProps) {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden auth-gradient-bg">
            {/* Decorative background orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-400/8 blur-3xl" />
                <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-300/5 blur-2xl" />
            </div>

            {/* Card */}
            <div
                className={cn(
                    'relative z-10 w-full max-w-[420px] rounded-2xl',
                    'bg-white/90 backdrop-blur-xl',
                    'border border-white/60',
                    'shadow-[0_8px_40px_rgb(0_0_0/0.08),0_2px_8px_rgb(0_0_0/0.04)]',
                    'p-8 sm:p-10',
                    'auth-card-enter',
                    className
                )}
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Image
                            src="/logo.png"
                            alt="Raizly"
                            width={180}
                            height={60}
                            priority
                            className="object-contain mix-blend-multiply"
                        />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="text-center mb-8">
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Content */}
                {children}
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center text-xs text-slate-400/80 z-10">
                © {new Date().getFullYear()} Raizly · Todos os direitos reservados
            </div>
        </div>
    )
}
