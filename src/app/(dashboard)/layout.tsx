import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, KanbanSquare, Settings, LogOut, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    const companyName = (company as any)?.name || 'CRM Workspace'

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="w-[260px] border-r bg-card hidden md:flex flex-col shadow-premium">
                {/* Logo & Company */}
                <div className="h-16 flex items-center gap-3 border-b px-5">
                    <span className="text-3xl" title="Raizly" role="img" aria-label="owl">🦉</span>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{companyName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">CRM</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Menu</p>
                    <ul className="grid gap-0.5">
                        <li>
                            <Link href="/">
                                <Button variant="ghost" className="w-full justify-start gap-3 h-10 rounded-xl font-medium text-sm hover:bg-accent">
                                    <KanbanSquare className="h-4 w-4" />
                                    Pipeline
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="w-full justify-start gap-3 h-10 rounded-xl font-medium text-sm hover:bg-accent">
                                    <BarChart3 className="h-4 w-4" />
                                    Painel de Controle
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings">
                                <Button variant="ghost" className="w-full justify-start gap-3 h-10 rounded-xl font-medium text-sm hover:bg-accent">
                                    <Settings className="h-4 w-4" />
                                    Configurações
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t">
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium">
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
                    <span className="text-xl mr-2">🦉</span>
                    <span className="font-semibold text-sm">{companyName}</span>
                </header>
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
