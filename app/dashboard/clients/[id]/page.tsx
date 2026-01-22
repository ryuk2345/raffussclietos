'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
    id: string
    company: string
    planBase: string
    status: string
    startDate: string
    renewalDate: string
    driveFolder?: string
}

interface Task {
    id: string
    title: string
    category: string
    status: string
    responsible: string
    deadline?: string
    progress: number
    clientId: string
}

export default function ClientDetail(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [team, setTeam] = useState<{ name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, tRes, teamRes, meRes] = await Promise.all([
                    fetch(`/api/clients/${params.id}`),
                    fetch('/api/tasks'),
                    fetch('/api/team'),
                    fetch('/api/auth/me')
                ])
                const clientData = await cRes.json()
                const tasksData = await tRes.json()
                const teamData = await teamRes.json()
                const meData = await meRes.json()

                setClient(clientData)
                setTasks(Array.isArray(tasksData) ? tasksData.filter((t: Task) => t.clientId === params.id) : [])
                setTeam(teamData)
                setUser(meData)
            } catch (err) {
                console.error("Error fetching client data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            // Auto-adjust progress based on status if not manually provided
            if (updates.status === 'Terminado' && updates.progress === undefined) {
                updates.progress = 100
            } else if (updates.status === 'Pendiente' && updates.progress === undefined) {
                updates.progress = 0
            }

            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
            }
        } catch (err) {
            console.error("Error updating task:", err)
        }
    }

    if (loading) return (
        <div className="p-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-black rounded-full border-t-transparent"></div>
        </div>
    )

    if (!client) return (
        <div className="p-10 text-center">
            <p className="text-gray-500 mb-4">Cliente no encontrado.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Volver al Dashboard</Link>
        </div>
    )

    const isAdmin = user?.role === 'Administrador' || user?.id === 'admin'

    // Filter tasks based on role
    const filteredTasks = isAdmin
        ? tasks
        : tasks.filter(t => (t.responsible || '').trim().toLowerCase() === (user?.name || '').trim().toLowerCase())

    const totalProgress = filteredTasks.length
        ? Math.round(filteredTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / filteredTasks.length)
        : 0

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{client.company}</h1>
                    <p className="text-gray-500 font-medium">Panel de control y seguimiento de objetivos</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold flex items-center gap-2"
                >
                    <span>←</span> Volver
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Progress */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wider">Perfil del Cliente</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-400 text-xs font-black uppercase">Plan de Servicio</span>
                                <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">{client.planBase}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-400 text-xs font-black uppercase">Estado</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter ${client.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {client.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-400 text-xs font-black uppercase">Fecha Inicio</span>
                                <span className="text-gray-700 font-bold text-sm">{client.startDate}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-400 text-xs font-black uppercase">Próximo Cobro</span>
                                <span className="text-gray-700 font-bold text-sm">{client.renewalDate}</span>
                            </div>
                            {client.driveFolder && (
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                    <span className="text-gray-400 text-xs font-black uppercase">Archivos</span>
                                    <a
                                        href={client.driveFolder}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                    >
                                        <span>📁</span> Ver en Drive
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Felicidad del Cliente</h2>
                            <div className="flex items-center justify-center mb-4">
                                <div className="text-5xl font-black text-gray-900">{totalProgress}<span className="text-xl text-blue-500">%</span></div>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-4 overflow-hidden mb-4 border border-gray-100 p-0.5">
                                <div
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                    style={{ width: `${totalProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{filteredTasks.length} tareas sincronizadas en este ciclo</p>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    </div>
                </div>

                {/* Right Column: Tasks */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                {isAdmin ? 'Tareas en Curso' : 'Mis Tareas Asignadas'}
                            </h2>
                            <div className="flex gap-2">
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Live</span>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {filteredTasks.map(t => (
                                <div key={t.id} className="p-8 hover:bg-gray-50/50 transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse ${t.status === 'Terminado' ? 'bg-green-500' :
                                                    t.status === 'En proceso' ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`}></span>
                                                <h3 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">{t.title}</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-3 items-center">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{t.category}</span>
                                                <span className="text-gray-300 text-xs">/</span>
                                                <div className="flex items-center gap-2 bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                                                    <span className="text-gray-400 text-[9px] font-black uppercase">Resp:</span>
                                                    <select
                                                        disabled={!isAdmin}
                                                        value={(t.responsible || 'Por asignar').trim()}
                                                        onChange={(e) => handleUpdateTask(t.id, { responsible: e.target.value.trim() })}
                                                        className="text-[11px] font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-default"
                                                    >
                                                        <option value="Por asignar">Por asignar</option>
                                                        <option>Admin</option>
                                                        <option>Diseñador</option>
                                                        <option>Trafficker</option>
                                                        <option>Dev</option>
                                                        {team.map(m => (
                                                            <option key={m.name} value={m.name.trim()}>{m.name.trim()}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={t.status}
                                                onChange={(e) => handleUpdateTask(t.id, { status: e.target.value })}
                                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm border appearance-none outline-none cursor-pointer transition-all ${t.status === 'Terminado' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    t.status === 'En proceso' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}
                                            >
                                                <option>Pendiente</option>
                                                <option>En proceso</option>
                                                <option>Terminado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mb-3">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-50 shadow-inner">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 shadow-lg"
                                                        style={{ width: `${t.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={t.progress || 0}
                                                    onChange={(e) => handleUpdateTask(t.id, { progress: parseInt(e.target.value) || 0 })}
                                                    className="text-sm font-black text-gray-900 w-8 text-right bg-transparent focus:outline-none"
                                                />
                                                <span className="text-sm font-black text-gray-900">%</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={t.progress || 0}
                                            onChange={(e) => handleUpdateTask(t.id, { progress: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>

                                    {t.deadline && (
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                <span className="text-lg">🗓️</span> Límite: {new Date(t.deadline).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </p>
                                            {(t.progress === 100 || t.status === 'Terminado') && <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter shadow-sm bg-green-50 px-2 py-0.5 rounded-full">✨ COMPLETADA</span>}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {tasks.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="text-6xl mb-6">☕</div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Tranquilidad absoluta.</p>
                                    <p className="text-gray-300 text-xs mt-1 italic font-medium">No hay tareas pendientes para este cliente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
