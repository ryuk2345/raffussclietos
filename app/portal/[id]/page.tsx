'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Task {
    id: string
    title: string
    status: string
    category: string
    comments?: any[]
    attachments?: any[]
    deadline?: string
}

interface Client {
    id: string
    company: string
    planBase: string
    driveFolder?: string
    metrics?: {
        reach: number
        leads: number
        clicks: number
    }
}

export default function ClientPortal() {
    const params = useParams()
    const id = params?.id as string
    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        Promise.all([
            fetch(`/api/clients?id=${id}`).then(res => res.json()),
            fetch(`/api/tasks?clientId=${id}`).then(res => res.json())
        ]).then(([c, t]) => {
            setClient(c)
            setTasks(Array.isArray(t) ? t : [])
            setLoading(false)
        })
    }, [id])

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Cargando tu experiencia...</div>
    if (!client) return <div className="p-10 text-center">Acceso denegado o cliente no encontrado</div>

    // Calculate Progress
    const completedTasks = tasks.filter(t => t.status === 'Terminado' || t.status === 'Aprobado').length
    const totalTasks = tasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Filter deliverables (Tasks that are explicitly deliverables or completed)
    const deliverables = tasks.filter(t => t.status === 'En revisión' || t.status === 'Aprobado' || t.category === 'Contenido')

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {client.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{client.company}</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Portal de Cliente</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-900">Tu Plan Actual</p>
                            <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full inline-block">{client.planBase}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

                {/* Welcome & Progress */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Mes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Progress Card */}
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-400 mb-2">Avance Global</h3>
                            <div className="flex items-end gap-4 mb-4">
                                <span className="text-6xl font-bold">{progress}%</span>
                                <span className="text-gray-400 mb-2">completado</span>
                            </div>
                            <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="mt-4 text-sm text-gray-400">Hemos completado {completedTasks} de {totalTasks} objetivos este mes.</p>
                        </div>

                        {/* Quick Metrics */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-6">
                            <div>
                                <p className="text-sm text-gray-500">Alcance (Reach)</p>
                                <p className="text-3xl font-bold text-gray-900">{client.metrics?.reach?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Leads Generados</p>
                                <p className="text-3xl font-bold text-indigo-600">{client.metrics?.leads?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <a href={client.driveFolder || '#'} target="_blank" className={`block w-full py-3 rounded-xl text-center font-bold transition ${client.driveFolder ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                    Ver Archivos (Drive) &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Split: Tasks & Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Deliverables & Approvals */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Entregables y Revisiones</h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{deliverables.length} pendientes</span>
                        </div>

                        <div className="space-y-4">
                            {deliverables.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                                    No hay entregables pendientes de revisión por ahora.
                                </div>
                            ) : deliverables.map(t => (
                                <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group transition hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wide mb-2 inline-block">{t.category}</span>
                                            <h4 className="text-lg font-bold text-gray-900">{t.title}</h4>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'Aprobado' ? 'bg-green-100 text-green-700' :
                                                t.status === 'En revisión' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                            }`}>{t.status}</span>
                                    </div>

                                    {/* Action Area */}
                                    <div className="bg-gray-50 rounded-lg p-4 mt-4 flex gap-3">
                                        <input
                                            placeholder="Escribe un comentario..."
                                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Enviar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Right: Timeline */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Próximos Pasos</h3>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {tasks.filter(t => t.status === 'Pendiente' || t.status === 'En proceso').slice(0, 5).map((t, idx) => (
                                    <div key={t.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            {idx + 1}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                                            </div>
                                            <div className="text-xs text-slate-500">{t.category} - {t.deadline || 'Pronto'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    )
}
