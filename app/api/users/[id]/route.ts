import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json()
        const updated = await prisma.user.update({
            where: { id: params.id },
            data: body
        })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.user.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 })
    }
}
