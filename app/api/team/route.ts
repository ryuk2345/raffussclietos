import { prisma } from '../../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const team = await prisma.user.findMany()
        return NextResponse.json(team)
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching team' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        if (body.name) body.name = body.name.trim()
        const newMember = await prisma.user.create({ data: body })
        return NextResponse.json(newMember)
    } catch (e) {
        return NextResponse.json({ error: 'Error creating team member' }, { status: 500 })
    }
}
