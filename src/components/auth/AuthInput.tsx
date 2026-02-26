'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    icon?: LucideIcon
    error?: string
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
    ({ label, icon: Icon, error, className, id, ...props }, ref) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="space-y-1.5">
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <Icon
                            className={cn(
                                'absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors duration-200',
                                error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-600'
                            )}
                            strokeWidth={1.8}
                        />
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        className={cn(
                            'group flex h-11 w-full rounded-xl border bg-white/80 px-3 py-2 text-sm text-slate-900',
                            'shadow-sm backdrop-blur-sm transition-all duration-200 ease-out',
                            'placeholder:text-slate-400',
                            'hover:border-slate-300 hover:shadow-md',
                            'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            Icon && 'pl-10',
                            error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

AuthInput.displayName = 'AuthInput'

export { AuthInput }
