import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Auth callback route — processes the authorization code from Supabase
 * (magic links, password reset, etc.) and exchanges it for a session.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            const response = isLocalEnv || !forwardedHost
                ? NextResponse.redirect(`${origin}${next}`)
                : NextResponse.redirect(`https://${forwardedHost}${next}`)

            // Set cookies from the supabase response
            const allCookies = request.cookies.getAll()
            allCookies.forEach(cookie => {
                response.cookies.set(cookie.name, cookie.value)
            })

            return response
        }
    }

    // If there's no code or an error, redirect to login with error
    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Link inválido ou expirado. Solicite um novo link.')}`
    )
}
