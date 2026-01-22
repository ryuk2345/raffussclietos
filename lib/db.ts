import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export interface Client {
    id: string
    company: string
    contactName?: string
    email?: string
    planBase: string
    status: string
    startDate?: string
    renewalDate?: string
    driveFolder?: string
    accessCode?: string
    platforms?: string[]
    metrics?: {
        reach: number
        leads: number
        clicks: number
        spent: number
    }
    billingCycle?: string
    password?: string
}

export interface Task {
    id: string
    title: string
    category?: string
    status: string
    progress?: number
    clientId: string
    responsible?: string
    deadline?: string
    description?: string
    comments?: any[]
    attachments?: any[]
    clientFeedback?: string
}

export interface User {
    id: string
    name: string
    role: string
    email: string
    passwordHash: string
    status: string
}
