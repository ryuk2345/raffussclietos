'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Interfaces match new DB structure
interface ClientMetrics {
    reach: number
    leads: number
    clicks: number
    spent: number
    driveFolder?: string
}

interface Client {
    id: string
    company: string
    contactName?: string
    planBase: string
    status: string
    startDate?: string
    renewalDate?: string
    metrics?: ClientMetrics
    budget?: number
}

interface Task {
    id: string
    title: string
    status: string
    clientId: string
    category?: string
    responsible?: string
    deadline?: string
}

export default function ClientDetail() {
    const params = useParams()
    const id = params?.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    const fetchData = () => {
        if (!id) return
        Promise.all([
            fetch(`/api/clients?id=${id}`).then(res => res.json()),
            fetch(`/api/tasks?clientId=${id}`).then(res => res.json())
        ]).then(([clientData, tasksData]) => {
            setClient(clientData)
            setTasks(Array.isArray(tasksData) ? tasksData : [])
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchData()
    }, [id])

    if (loading) return <div className="p-10 flex justify-center items-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
    if (!client) return <div className="p-10 text-center text-red-500">Cliente no encontrado</div>

    // Group tasks by category
    const groupedTasks: Record<string, Task[]> = {
        'Estrategia': [],
        'Contenido': [],
        'Ads': [],
        'Web': [],
        'Reporte': [],
        'General': []
    }

    tasks.forEach(t => {
        const cat = t.category || 'General'
        if (!groupedTasks[cat]) groupedTasks[cat] = []
        groupedTasks[cat].push(t)
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">&larr; Volver</Link>
                    <h1 className="text-xl font-bold text-gray-800">{client.company} <span className="text-sm font-normal text-gray-500">| Panel de Cliente</span></h1>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{client.planBase}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${client.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {client.status}
                    </span>
                </div>
            </header>

            <div className="flex-1 p-8 grid grid-cols-12 gap-8">

                {/* Sidebar Info */}
                <aside className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">Información del Plan</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500">Renovación</p>
                                <p className="font-medium">{client.renewalDate || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Presupuesto Ads</p>
                                <p className="font-medium">${client.budget || 0} USD</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Inicio de contrato</p>
                                <p className="font-medium">{client.startDate || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Contacto</p>
                                <p className="font-medium">{client.contactName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Entregables</h3>
                        <p className="text-white/80 text-sm mb-4">Accede a tu carpeta de archivos compartidos.</p>
                        {(client as any).driveFolder ? (
                            <a href={(client as any).driveFolder} target="_blank" rel="noopener noreferrer" className="block w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm text-center">
                                Ver Carpeta Drive &rarr;
                            </a>
                        ) : (
                            <button disabled className="w-full bg-white/10 text-white/50 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                                Sin Link Configurado
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Acceso Portal Cliente</h3>
                        <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                            <code className="text-lg font-mono font-bold text-gray-800">{(client as any).accessCode || '---'}</code>
                            <button onClick={() => {
                                navigator.clipboard.writeText((client as any).accessCode)
                                alert('Código copiado')
                            }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Copiar</button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Comparte este código con el cliente para que acceda a su portal.</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="col-span-12 lg:col-span-9 space-y-8">

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Alcance Total', value: client.metrics?.reach?.toLocaleString() || 0, color: 'text-blue-600' },
                            { label: 'Leads Mes', value: client.metrics?.leads || 0, color: 'text-green-600' },
                            { label: 'Clicks', value: client.metrics?.clicks?.toLocaleString() || 0, color: 'text-purple-600' },
                            { label: 'Inversión', value: `$${client.metrics?.spent || 0}`, color: 'text-orange-600' },
                        ].map((m, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">{m.label}</p>
                                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tasks Categories */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Progreso del Mes</h2>
                            <button onClick={() => alert('Función de reporte en desarrollo')} className="text-sm text-blue-600 hover:underline">Descargar Reporte PDF</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(groupedTasks).map(([category, items]) => (
                                items.length > 0 && (
                                    <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-700">{category}</h3>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
                                        </div>
                                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                            {items.map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => setEditingTask(t)}
                                                    className="p-4 hover:bg-gray-50 transition flex items-start gap-3 cursor-pointer group"
                                                >
                                                    <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${t.status === 'Terminado' || t.status === 'Aprobado' ? 'bg-green-500' :
                                                        t.status === 'En proceso' ? 'bg-blue-500' :
                                                            t.status === 'En revisión' ? 'bg-yellow-400' : 'bg-gray-300'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{t.title}</h4>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Resp: {t.responsible || 'N/A'}</span>
                                                                {t.deadline && (
                                                                    <span className={`text-xs ${new Date(t.deadline) < new Date() && t.status !== 'Terminado' ? 'text-red-600 font-bold animate-pulse' : 'text-gray-500'
                                                                        }`}>
                                                                        {new Date(t.deadline) < new Date() && t.status !== 'Terminado' ? '⚠ ' : ''}
                                                                        {t.deadline}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">{t.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Task Edit Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Editar Tarea</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            // Optimistic update
                            const updated = { ...editingTask }
                            setTasks(tasks.map(t => t.id === updated.id ? updated : t))
                            setEditingTask(null)

                            await fetch(`/api/tasks/${updated.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify(updated)
                            })
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    className="w-full border p-2 rounded-lg"
                                    value={editingTask.title}
                                    onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        className="w-full border p-2 rounded-lg bg-white"
                                        value={editingTask.status}
                                        onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                                    >
                                        <option>Pendiente</option>
                                        <option>En proceso</option>
                                        <option>En revisión</option>
                                        <option>Aprobado</option>
                                        <option>Terminado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                                    <select
                                        className="w-full border p-2 rounded-lg bg-white"
                                        value={editingTask.responsible || ''}
                                        onChange={e => setEditingTask({ ...editingTask, responsible: e.target.value })}
                                    >
                                        <option value="">Sin asignar</option>
                                        <option>Rafael</option>
                                        <option>Diseñador</option>
                                        <option>Trafficker</option>
                                        <option>Dev</option>
                                        <option>Community Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite (Alerta si vence)</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded-lg"
                                    value={editingTask.deadline || ''}
                                    onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Guardar Cambios</button>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (!confirm('¿Eliminar tarea?')) return
                                    const id = editingTask.id
                                    setTasks(tasks.filter(t => t.id !== id))
                                    setEditingTask(null)
                                    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
                                }}
                                className="w-full text-red-500 text-sm mt-2 hover:underline"
                            >
                                Eliminar tarea permanentemente
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
