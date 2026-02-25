'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle } from 'lucide-react'
import { createLeadAction } from '@/app/(dashboard)/actions'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function CreateLeadModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const queryClient = useQueryClient()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            company_name: formData.get('company_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            value: Number(formData.get('value')) || 0,
        }

        try {
            await createLeadAction(data)
            toast.success('Lead criado com sucesso')
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['leads'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        } catch (error: any) {
            toast.error('Falha ao criar lead: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Novo Lead</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Lead</DialogTitle>
                    <DialogDescription>
                        Adicione um novo lead à sua pipeline. Ele será adicionado à primeira fase.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Contato</Label>
                            <Input id="name" name="name" required placeholder="João Silva" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Nome da Empresa</Label>
                            <Input id="company_name" name="company_name" placeholder="Empresa Exemplo" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" placeholder="joao@exemplo.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" name="phone" placeholder="+55 11 99999-9999" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value">Valor do Negócio ($)</Label>
                            <Input id="value" name="value" type="number" min="0" placeholder="5000" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Lead'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
