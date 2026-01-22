const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

async function main() {
    console.log('🚀 Iniciando migración de datos de db.json a la nueva base de datos...')

    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Error: No se encontró el archivo data/db.json')
        return
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))

    // 1. Migrar Usuarios
    console.log('👥 Migrando usuarios...')
    const team = data.team || []
    const users = data.users || []
    const allUsers = [...users]

    // Merge team into users if not already there
    team.forEach(m => {
        if (!allUsers.find(u => u.email.toLowerCase() === m.email.toLowerCase())) {
            allUsers.push({ ...m, passwordHash: '123' })
        }
    })

    for (const user of allUsers) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                role: user.role,
                passwordHash: user.passwordHash || '123',
                status: user.status || 'Activo'
            },
            create: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                passwordHash: user.passwordHash || '123',
                status: user.status || 'Activo'
            }
        })
    }

    // 2. Migrar Servicios
    console.log('📦 Migrando servicios...')
    for (const service of (data.services || [])) {
        await prisma.servicePackage.upsert({
            where: { id: service.id },
            update: {
                name: service.name,
                description: service.description,
                price: service.price,
                features: service.features,
                status: service.status
            },
            create: {
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                features: service.features,
                status: service.status
            }
        })
    }

    // 3. Migrar Clientes
    console.log('🏢 Migrando clientes...')
    for (const client of (data.clients || [])) {
        await prisma.client.upsert({
            where: { id: client.id },
            update: {
                company: client.company,
                contactName: client.contactName,
                email: client.email,
                planBase: client.planBase,
                status: client.status,
                startDate: client.startDate,
                renewalDate: client.renewalDate,
                driveFolder: client.driveFolder || "",
                accessCode: client.accessCode,
                platforms: client.platforms || [],
                metrics: client.metrics || {},
                billingCycle: client.billingCycle || "30",
                password: client.password || "123"
            },
            create: {
                id: client.id,
                company: client.company,
                contactName: client.contactName,
                email: client.email,
                planBase: client.planBase,
                status: client.status,
                startDate: client.startDate,
                renewalDate: client.renewalDate,
                driveFolder: client.driveFolder || "",
                accessCode: client.accessCode,
                platforms: client.platforms || [],
                metrics: client.metrics || {},
                billingCycle: client.billingCycle || "30",
                password: client.password || "123"
            }
        })
    }

    // 4. Migrar Tareas
    console.log('✅ Migrando tareas...')
    for (const task of (data.tasks || [])) {
        // Check if client exists
        const clientExists = await prisma.client.findUnique({ where: { id: task.clientId } })
        if (!clientExists) {
            console.warn(`⚠️ Saltando tarea ${task.id}: El cliente ${task.clientId} no existe.`)
            continue
        }

        await prisma.task.upsert({
            where: { id: task.id },
            update: {
                title: task.title,
                category: task.category,
                status: task.status,
                progress: task.progress || 0,
                clientId: task.clientId,
                responsible: task.responsible,
                deadline: task.deadline,
                description: task.description,
                comments: task.comments || [],
                attachments: task.attachments || [],
                clientFeedback: task.clientFeedback
            },
            create: {
                id: task.id,
                title: task.title,
                category: task.category,
                status: task.status,
                progress: task.progress || 0,
                clientId: task.clientId,
                responsible: task.responsible,
                deadline: task.deadline,
                description: task.description,
                comments: task.comments || [],
                attachments: task.attachments || [],
                clientFeedback: task.clientFeedback
            }
        })
    }

    console.log('✨ Migración completada con éxito.')
}

main()
    .catch((e) => {
        console.error('❌ Error durante la migración:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
