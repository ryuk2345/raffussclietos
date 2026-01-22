import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { accessCode } = await req.json()
        const client = await prisma.client.findUnique({ where: { accessCode } })

        if (client) {
            // Set session cookie
            const cookieStore = await cookies()
            cookieStore.set('client_session', client.id, { httpOnly: true })
            return NextResponse.json({ success: true, clientId: client.id })
        }

        return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
    } catch (e) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
