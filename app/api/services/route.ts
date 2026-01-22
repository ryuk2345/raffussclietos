import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const services = await prisma.servicePackage.findMany()
        return NextResponse.json(services)
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const newService = await prisma.servicePackage.create({ data: body })
        return NextResponse.json(newService)
    } catch (e) {
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
    }
}
