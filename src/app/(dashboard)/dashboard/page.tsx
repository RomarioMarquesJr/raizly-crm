import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/crm/dashboard/DashboardClient'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: memberData, error } = await (supabase as any)
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error || !memberData) redirect('/onboarding')

    return <DashboardClient companyId={memberData.company_id} />
}
