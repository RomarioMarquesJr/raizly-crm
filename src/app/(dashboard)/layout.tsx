import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: memberData, error } = await supabase
        .from('company_members')
        .select('company_id, companies(name)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching company member layout:', error)
    }

    if (!memberData) {
        redirect('/onboarding')
    }

    const company = Array.isArray(memberData.companies) ? memberData.companies[0] : memberData.companies
    const companyName = company?.name || 'CRM Workspace'

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col">
                <div className="h-20 flex items-center justify-center border-b px-4 mix-blend-multiply overflow-hidden">
                    <span className="text-4xl" title="Corujinha olhando tudo!" role="img" aria-label="owl">🦉</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="grid gap-1 px-2">
                        <li>
                            <Link href="/">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Pipeline
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Users className="h-4 w-4" />
                                    Painel de Controle
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Settings className="h-4 w-4" />
                                    Configurações
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="p-4 border-t">
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="h-14 flex items-center border-b px-4 md:hidden">
                    <span className="font-semibold">{companyName}</span>
                </header>
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    {children}
                </div>
            </main>
        </div>
    )
}
