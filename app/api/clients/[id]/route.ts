import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const client = await prisma.client.findUnique({ where: { id: params.id } })
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }
        return NextResponse.json(client)
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching client' }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        // Delete client
        await prisma.client.delete({ where: { id: params.id } })

        // Also delete all tasks associated with this client
        const allTasks = await prisma.task.findMany()
        const clientTasks = allTasks.filter(t => t.clientId === params.id)
        for (const task of clientTasks) {
            await prisma.task.delete({ where: { id: task.id } })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error deleting client' }, { status: 500 })
    }
}
