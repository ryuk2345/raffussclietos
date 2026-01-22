import { prisma } from '../../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const users = await prisma.user.findMany()
        return NextResponse.json(users)
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const newUser = await prisma.user.create({ data: body })
        return NextResponse.json(newUser)
    } catch (e) {
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
    }
}
