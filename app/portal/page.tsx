'use client'
import { useEffect, useState } from 'react'

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

export default function PortalDashboard() {
    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current client info from auth session
                const meRes = await fetch('/api/auth/me')
                const me = await meRes.json()

                if (me.error) {
                    setErrorMsg(`Sesión fallida: ${me.error}`)
                    return
                }

                if (me.type !== 'client') {
                    setErrorMsg("Tu cuenta no tiene perfil de cliente.")
                    return
                }

                if (!me.id) {
                    setErrorMsg("No se pudo identificar tu ID de usuario.")
                    return
                }

                const [cRes, tRes] = await Promise.all([
                    fetch(`/api/clients/${me.id}`),
                    fetch('/api/tasks')
                ])

                const clientData = await cRes.json()
                if (clientData.error) {
                    setErrorMsg(`Error de cliente: ${clientData.error}`)
                    return
                }

                const tasksData = await tRes.json()
                if (tasksData.error) {
                    console.error("Task error:", tasksData.error)
                }

                setClient(clientData)
                setTasks(Array.isArray(tasksData) ? tasksData.filter((t: Task) => t.clientId === me.id) : [])
            } catch (err) {
                console.error("Error fetching portal data:", err)
                setErrorMsg("Error de conexión con el servidor.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex justify-center p-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
    )

    if (errorMsg || !client) return (
        <div className="text-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {errorMsg ? "Algo salió mal" : "Acceso restringido"}
            </h2>
            <p className="text-gray-500 max-w-sm">
                {errorMsg || "No hemos podido encontrar los detalles de tu cuenta."}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
                Reintentar
            </button>
        </div>
    )

    const totalProgress = tasks.length
        ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
        : 0

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Welcome */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black mb-4">¡Hola, {client.company}! 👋</h1>
                    <p className="text-blue-100 text-sm md:text-lg max-w-xl">
                        Aquí puedes seguir en tiempo real el avance de tu proyecto y todas las tareas que estamos realizando para tu marca.
                    </p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Estado de Cuenta</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-gray-500 text-xs font-bold uppercase">Plan Actual</span>
                                <span className="text-blue-600 font-black">{client.planBase}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-gray-500 text-xs font-bold uppercase">Próxima Renovación</span>
                                <span className="text-gray-900 font-bold">{client.renewalDate}</span>
                            </div>
                            {client.driveFolder && (
                                <a
                                    href={client.driveFolder}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl group"
                                >
                                    <span className="text-blue-600 text-xs font-bold uppercase">Carpeta de Entregables</span>
                                    <span className="text-blue-700 font-black flex items-center gap-2">
                                        Drive <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Avance General</h2>
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    className="text-gray-100"
                                    strokeWidth="10"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className="text-blue-600 transition-all duration-1000 ease-out"
                                    strokeWidth="10"
                                    strokeDasharray={364.42}
                                    strokeDashoffset={364.42 - (364.42 * totalProgress) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <span className="absolute text-3xl font-black text-gray-900">{totalProgress}%</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{tasks.filter(t => t.status === 'Terminado').length} de {tasks.length} tareas completadas</p>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Registro de Trabajo</h2>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">En Vivo</span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                            {tasks.map(t => (
                                <div key={t.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${t.status === 'Terminado' ? 'bg-green-500' :
                                                    t.status === 'En proceso' ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`}></span>
                                                <h3 className="font-bold text-gray-900 text-lg">{t.title}</h3>
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.category}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">Responsable</p>
                                                <p className="text-xs font-bold text-gray-700">{t.responsible}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                                                {t.responsible?.charAt(0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-indigo-700"
                                                    style={{ width: `${t.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-gray-900 w-10 text-right">{t.progress}%</span>
                                    </div>
                                </div>
                            ))}

                            {tasks.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="text-5xl mb-4 opacity-20">📂</div>
                                    <p className="text-gray-400 font-bold">Aún no hay tareas registradas.</p>
                                    <p className="text-gray-300 text-xs mt-1 italic">Vuelve pronto para ver el progreso.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
