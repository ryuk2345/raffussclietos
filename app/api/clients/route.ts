import { prisma } from '@/lib/db'
import { generateTasksForPlan } from '@/services/taskGenerator'
import { NextResponse } from 'next/server'



export async function POST(req: Request) {
    try {
        const body = await req.json()
        // Enrich body with defaults
        const { billingCycle, ...rest } = body
        const today = new Date();
        const cycleDays = parseInt(billingCycle || '30')
        const renewalDate = new Date(today);
        renewalDate.setDate(today.getDate() + cycleDays);

        const clientData = {
            ...rest,
            startDate: body.startDate || today.toISOString().split('T')[0],
            renewalDate: renewalDate.toISOString().split('T')[0],
            metrics: { reach: 0, leads: 0, clicks: 0, spent: 0 }
        }

        const client = await prisma.client.create({ data: clientData })

        // Auto-generate tasks based on plan
        await generateTasksForPlan(client)

        return NextResponse.json(client)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
        const client = await prisma.client.findUnique({ where: { id } })
        return NextResponse.json(client)
    }

    const clients = await prisma.client.findMany()
    return NextResponse.json(clients)
}


