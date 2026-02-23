import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-muted/40">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6 overflow-visible w-full mix-blend-multiply">
                        <Image src="/logo.png" alt="Raizly Logo" width={220} height={80} priority className="object-contain" />
                    </div>
                    <CardTitle className="text-2xl mt-4">Welcome Back</CardTitle>
                    <CardDescription>Enter your email below to login or sign up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {searchParams?.error && (
                            <div className="text-sm text-red-500 text-center">{searchParams.error}</div>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                            <Button formAction={login} className="w-full">
                                Log in
                            </Button>
                            <Button formAction={signup} variant="outline" className="w-full">
                                Sign up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
