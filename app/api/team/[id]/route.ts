import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const body = await req.json()
        if (body.name) body.name = body.name.trim()
        const updated = await prisma.user.update({
            where: { id: params.id },
            data: body
        })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: 'Error updating team member' }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        await prisma.user.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error deleting team member' }, { status: 500 })
    }
}
