import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createCompany } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OnboardingPage(props: { searchParams: Promise<{ error?: string }> }) {
    const supabase = await createClient()

    // Verify auth
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if they already have a company
    const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)

    if (memberData && memberData.length > 0) {
        redirect('/')
    }

    const searchParams = await props.searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-muted/40">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome</CardTitle>
                    <CardDescription>Let's create your company workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Acme Corp"
                                required
                            />
                        </div>
                        {searchParams?.error && (
                            <div className="text-sm text-red-500 text-center">{searchParams.error}</div>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                            <Button formAction={createCompany} className="w-full">
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
