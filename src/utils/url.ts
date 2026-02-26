/**
 * Returns the base URL for the application based on environment.
 * Uses NEXT_PUBLIC_SITE_URL in production, falls back to localhost in dev.
 */
export function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    }
    return 'http://localhost:3000'
}

/**
 * Returns the full redirect URL for the password reset callback.
 * The callback route exchanges the auth code for a session,
 * then redirects the user to /reset-password.
 */
export function getResetPasswordRedirectUrl(): string {
    return `${getBaseUrl()}/auth/callback?next=/reset-password`
}
