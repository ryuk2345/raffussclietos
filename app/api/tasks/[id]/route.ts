import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const body = await req.json()
        const updated = await prisma.task.update({
            where: { id: params.id },
            data: body
        })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        await prisma.task.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
    }
}
