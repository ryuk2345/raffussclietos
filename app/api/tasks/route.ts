import { prisma } from '../../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    const where = clientId ? { clientId } : {}
    const tasks = await prisma.task.findMany({ where })
    return NextResponse.json(tasks)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const task = await prisma.task.create({ data: body })
        return NextResponse.json(task)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
    }
}
