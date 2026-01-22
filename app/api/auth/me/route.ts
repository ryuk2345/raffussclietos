import { getSession } from '../../../../../lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await getSession()
    if (session) {
        return NextResponse.json(session)
    }
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}
