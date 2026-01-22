import { cookies } from 'next/headers'
import { prisma } from './db'

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session_token')

    if (!session?.value) return null

    if (session.value === 'admin') {
        return { name: 'Admin', role: 'Administrador', id: 'admin' }
    }

    if (session.value.startsWith('user:')) {
        const id = session.value.split(':')[1]
        const user = await prisma.user.findUnique({ where: { id } })
        return user ? { name: user.name, role: user.role, id: user.id, type: 'user' } : null
    }

    if (session.value.startsWith('client:')) {
        const id = session.value.split(':')[1]
        const client = await prisma.client.findUnique({ where: { id } })
        return client ? { name: client.company, role: 'Cliente', id: client.id, type: 'client' } : null
    }

    return null
}

export async function login(email: string, password?: string) {
    // This is now primarily handled in the API route, 
    // but we can keep a helper here if needed.
    return { success: false }
}

export async function logout() {
    // Handled in API route
}

