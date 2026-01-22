import { prisma } from "@/lib/db";

export async function generateTasksForPlan(client: any) {
    const tasks = [];
    const today = new Date().toISOString().split('T')[0];

    // Logic based on Plan
    if (client.planBase === 'Started') {
        tasks.push(
            { title: 'Análisis de Mercado Inicial', category: 'Estrategia', responsible: 'Admin' },
            { title: 'Configuración de 1 Plataforma', category: 'Redes', responsible: 'Equipo' },
            { title: 'Campaña Activa (Setup)', category: 'Ads', responsible: 'Trafficker' },
            { title: 'Post Semanal 1', category: 'Contenido', responsible: 'Diseñador' },
            { title: 'Post Semanal 2', category: 'Contenido', responsible: 'Diseñador' },
            { title: 'Post Semanal 3', category: 'Contenido', responsible: 'Diseñador' },
            { title: 'Post Semanal 4', category: 'Contenido', responsible: 'Diseñador' },
            { title: 'Reporte Mensual', category: 'Reporte', responsible: 'Admin' }
        );
    } else if (client.planBase === 'Growth') {
        tasks.push(
            { title: 'Análisis de Mercado Profundo', category: 'Estrategia', responsible: 'Admin' },
            { title: 'Gestión 2 Plataformas', category: 'Redes', responsible: 'Equipo' },
            { title: 'Configuración Bot IA', category: 'Tech', responsible: 'Dev' },
            { title: 'Optimización Web Básica', category: 'Web', responsible: 'Dev' },
            // 12 posts (3 per week)
            ...Array.from({ length: 4 }).flatMap((_, w) => [
                { title: `Semana ${w + 1}: Post 1`, category: 'Contenido', responsible: 'Diseñador' },
                { title: `Semana ${w + 1}: Post 2`, category: 'Contenido', responsible: 'Diseñador' },
                { title: `Semana ${w + 1}: Post 3`, category: 'Contenido', responsible: 'Diseñador' }
            ]),
            { title: 'Campaña 1 (Branding)', category: 'Ads', responsible: 'Trafficker' },
            { title: 'Campaña 2 (Conversión)', category: 'Ads', responsible: 'Trafficker' },
            { title: 'Campaña 3 (Retargeting)', category: 'Ads', responsible: 'Trafficker' }
        );
    } else if (client.planBase === 'Scale') {
        tasks.push(
            { title: 'Estrategia Avanzada Omnicanal', category: 'Estrategia', responsible: 'Admin' },
            { title: 'Automatización de Flujos', category: 'Tech', responsible: 'Dev' },
            { title: 'Desarrollo/Mejora Ecosistema Web', category: 'Web', responsible: 'Dev' },
            // 16 posts
            ...Array.from({ length: 4 }).flatMap((_, w) => [
                { title: `Semana ${w + 1}: Pack Contenido (4 posts)`, category: 'Contenido', responsible: 'Diseñador' }
            ]),
            { title: 'Campañas High-Ticket', category: 'Ads', responsible: 'Trafficker' },
            { title: 'Soporte VIP Mensual', category: 'Soporte', responsible: 'Admin' }
        );
    } else {
        // Default fallback
        tasks.push({ title: 'Onboarding Cliente', category: 'Estrategia', responsible: 'Admin' });
    }

    for (const t of tasks) {
        await prisma.task.create({
            data: {
                title: t.title,
                category: t.category || 'General',
                status: 'Pendiente',
                responsible: t.responsible || 'Por asignar',
                deadline: today,
                clientId: client.id
            }
        });
    }
}
