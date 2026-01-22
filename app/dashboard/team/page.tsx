'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Task {
    id: string
    title: string
    status: string
    category: string
    responsible?: string
    deadline?: string
    clientId: string
}

interface Client {
    id: string
    company: string
}

interface TeamMember {
    id: string
    name: string
    role: string
}

export default function TeamPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [clients, setClients] = useState<Record<string, string>>({})
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/tasks').then(res => res.json()),
            fetch('/api/clients').then(res => res.json()),
            fetch('/api/team').then(res => res.json()),
            fetch('/api/auth/me').then(res => res.json())
        ]).then(([tasksData, clientsData, teamData, userData]) => {
            const clientMap: Record<string, string> = {}
            if (Array.isArray(clientsData)) {
                clientsData.forEach((c: Client) => {
                    clientMap[c.id] = c.company
                })
            }
            setClients(clientMap)
            setTasks(Array.isArray(tasksData) ? tasksData : [])
            setTeamMembers(Array.isArray(teamData) ? teamData : [])
            setUser(userData)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-black rounded-full border-t-transparent"></div></div>

    // Identify real members
    const realMemberNames = new Set(teamMembers.map(m => m.name.trim().toLowerCase()))

    // RBAC: If not admin, only see own tasks
    const isAdmin = user?.role === 'Administrador' || user?.id === 'admin'
    const myTasks = isAdmin
        ? tasks
        : tasks.filter(t => (t.responsible || '').trim().toLowerCase() === (user?.name || '').trim().toLowerCase())

    // Separate tasks: unassigned (role or null) vs assigned to person
    const unassignedTasks = myTasks.filter(t => {
        const resp = (t.responsible || 'Por asignar').trim().toLowerCase()
        return resp === 'por asignar' || resp === 'sin asignar' || !realMemberNames.has(resp)
    })

    const getMemberTasks = (memberName: string) => {
        return myTasks.filter(t => (t.responsible || '').trim().toLowerCase() === memberName.trim().toLowerCase())
    }

    const visibleTeamMembers = isAdmin
        ? teamMembers
        : teamMembers.filter(m => m.name.trim().toLowerCase() === (user?.name || '').trim().toLowerCase())

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-8">
            <header className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Gestión de Carga</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Optimización y flujo de trabajo del equipo</p>
                </div>
                <Link href="/dashboard" className="bg-white text-gray-900 border border-gray-100 px-6 py-3 rounded-2xl hover:shadow-lg transition-all font-black text-xs uppercase tracking-widest shadow-sm">
                    &larr; Escritorio
                </Link>
            </header>

            {/* Section 1: Tasks queue (The "Roles" tasks and "Por asignar") - ONLY FOR ADMINS */}
            {isAdmin && (
                <section className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bandeja de Entrada</h2>
                        <span className="bg-red-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse shadow-lg shadow-red-500/20">
                            {unassignedTasks.length} PENDIENTES
                        </span>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 no-scrollbar">
                        {unassignedTasks.map(t => (
                            <div
                                key={t.id}
                                onClick={() => setEditingTask(t)}
                                className="bg-white min-w-[280px] max-w-[280px] p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-y-12 translate-x-12 group-hover:bg-blue-50 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                            {t.category}
                                        </span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            Role: {t.responsible || 'General'}
                                        </span>
                                    </div>
                                    <h3 className="text-md font-black text-gray-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{t.title}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter">
                                            {clients[t.clientId] || 'Cliente'}
                                        </span>
                                        <span className="text-blue-500 font-black text-xs">Asignar &rarr;</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {unassignedTasks.length === 0 && (
                            <div className="w-full py-10 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-4xl mb-4">✨</span>
                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Bandeja limpia</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Section 2: Team Members Profiles */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {isAdmin ? 'Equipo Responsable' : 'Mis Tareas'}
                    </h2>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {visibleTeamMembers.map(member => {
                        const mTasks = getMemberTasks(member.name)
                        return (
                            <div key={member.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                                {/* Header Perfil */}
                                <div className="p-8 pb-6 bg-gradient-to-b from-gray-50/50 to-white">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-8 ring-blue-50 group-hover:rotate-3 transition-transform">
                                            {member.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{member.name}</h3>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, mTasks.length))].map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">
                                                    ✓
                                                </div>
                                            ))}
                                            {mTasks.length > 3 && (
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-500">
                                                    +{mTasks.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{mTasks.length} TAREAS</span>
                                    </div>
                                </div>

                                {/* Task List for this member */}
                                <div className="p-6 pt-0 flex-1 space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                                    {mTasks.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setEditingTask(t)}
                                            className="p-4 rounded-2xl border border-gray-50 bg-[#FDFDFF] hover:bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group/task"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.category}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Terminado' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            </div>
                                            <p className="text-xs font-bold text-gray-800 mb-2 leading-snug group-hover/task:text-blue-600 transition-colors truncate">{t.title}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                    {clients[t.clientId] || 'Cliente'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {mTasks.length === 0 && (
                                        <div className="py-12 text-center">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Disponible</p>
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                                        <button
                                            onClick={() => { }} // Could trigger an "Assign task" flow
                                            className="w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            Asignar nueva &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Edit Modal (Standardized) */}
            {editingTask && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-1 text-gray-900 uppercase tracking-tight">Gestionar Tarea</h2>
                            <p className="text-gray-400 text-xs mb-8 font-bold uppercase tracking-widest">
                                {clients[editingTask.clientId]} &bull; {editingTask.category}
                            </p>

                            <form onSubmit={async (e) => {
                                e.preventDefault()
                                const updated = { ...editingTask }
                                setTasks(tasks.map(t => t.id === updated.id ? updated : t))
                                setEditingTask(null)

                                await fetch(`/api/tasks/${updated.id}`, {
                                    method: 'PATCH',
                                    body: JSON.stringify(updated)
                                })
                            }} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título de la Tarea</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 ring-blue-500/20 outline-none transition-all font-bold text-gray-800"
                                        value={editingTask.title}
                                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-700"
                                            value={editingTask.status}
                                            onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                                        >
                                            <option>Pendiente</option>
                                            <option>En proceso</option>
                                            <option>Terminado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Responsable</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-black text-blue-600"
                                            value={(editingTask.responsible || '').trim()}
                                            onChange={e => setEditingTask({ ...editingTask, responsible: e.target.value.trim() })}
                                        >
                                            <option value="Por asignar">Por asignar</option>
                                            <optgroup label="Roles">
                                                <option>Admin</option>
                                                <option>Diseñador</option>
                                                <option>Trafficker</option>
                                                <option>Dev</option>
                                                <option>Community Manager</option>
                                            </optgroup>
                                            <optgroup label="Equipo">
                                                {teamMembers.map(m => (
                                                    <option key={m.id} value={m.name.trim()}>{m.name.trim()}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTask(null)}
                                        className="flex-1 py-4 text-gray-400 hover:text-gray-600 transition text-xs font-black uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl hover:shadow-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/30"
                                    >
                                        Actualizar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
