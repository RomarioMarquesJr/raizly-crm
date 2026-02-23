import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: memberData, error } = await (supabase as any)
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error || !memberData) redirect('/onboarding')

    const [stagesRes, membersRes] = await Promise.all([
        (supabase as any)
            .from('pipeline_stages')
            .select('*')
            .eq('company_id', memberData.company_id)
            .order('order', { ascending: true }),
        (supabase as any)
            .from('company_members')
            .select('*')
            .eq('company_id', memberData.company_id),
    ])

    const stages = stagesRes.data || []
    const members = membersRes.data || []

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie as preferências da sua área de trabalho.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fases da Pipeline</CardTitle>
                    <CardDescription>Personalize as fases da sua pipeline de vendas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stages.map((stage: any) => (
                            <div key={stage.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color || '#ccc' }} />
                                    <span className="font-semibold">{stage.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">Ordem: {stage.order}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Membros da Equipe</CardTitle>
                    <CardDescription>Gerencie quem tem acesso a esta área de trabalho.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {members.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {member.user_id.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">ID de Usuário: {member.user_id.substring(0, 8)}...</span>
                                    </div>
                                </div>
                                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                    {member.role.toUpperCase()}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
