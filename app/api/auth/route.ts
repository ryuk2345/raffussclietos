import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const logout = searchParams.get('logout')

    if (logout === 'true') {
        const response = NextResponse.redirect(new URL('/login', req.url))
        response.cookies.delete('session_token')
        return response
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        // 1. Check for Admin password (Legacy Hardcoded)
        if (password === 'admin123' && (!email || email === 'admin@admin.com')) {
            const response = NextResponse.json({ success: true, redirectTo: '/dashboard' })
            response.cookies.set('session_token', 'admin', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            })
            return response
        }

        // 2. Check for Team Members (Users) in DB
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        })

        if (user && user.status === 'Activo') {
            const storedPassword = user.passwordHash || '123456'
            if (password === storedPassword) {
                const response = NextResponse.json({ success: true, redirectTo: '/dashboard' })
                response.cookies.set('session_token', `user:${user.id}`, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                })
                return response
            } else {
                return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
            }
        }

        // 3. Check for Clients in DB
        const client = await prisma.client.findFirst({
            where: { email: email.toLowerCase().trim() }
        })

        if (client && client.status === 'Activo') {
            const storedPassword = client.password || client.accessCode || '123456'
            if (password === storedPassword) {
                const response = NextResponse.json({ success: true, redirectTo: `/portal` })
                response.cookies.set('session_token', `client:${client.id}`, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                })
                return response
            } else {
                return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
            }
        }

        return NextResponse.json({ error: 'Credenciales inválidas o cuenta inactiva' }, { status: 401 })
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('session_token')
    return response
}
