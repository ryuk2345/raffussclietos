'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
    id: string
    company: string
    planBase: string
    status: string
}

export default function Dashboard() {
    const [clients, setClients] = useState<Client[]>([])
    const [user, setUser] = useState<any>(null)
    const [tasks, setTasks] = useState<any[]>([])

    const fetchData = async () => {
        try {
            const [cRes, meRes, tRes] = await Promise.all([
                fetch('/api/clients'),
                fetch('/api/auth/me'),
                fetch('/api/tasks')
            ])
            const clientsData = await cRes.json()
            const userData = await meRes.json()
            const tasksData = await tRes.json()

            if (Array.isArray(clientsData)) setClients(clientsData)
            setUser(userData)
            if (Array.isArray(tasksData)) setTasks(tasksData)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id: string, company: string) => {
        if (!confirm(`¿Eliminar cliente "${company}" y todas sus tareas?`)) return

        await fetch(`/api/clients/${id}`, { method: 'DELETE' })
        fetchData()
    }

    const isAdmin = user?.role === 'Administrador' || user?.id === 'admin'

    // Filter clients for non-admins: only those with at least one task assigned to them
    const visibleClients = isAdmin
        ? clients
        : clients.filter(c => tasks.some(t =>
            t.clientId === c.id &&
            (t.responsible || '').trim().toLowerCase() === (user?.name || '').trim().toLowerCase()
        ))


    return (
        <div className="p-10 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
                {isAdmin && (
                    <div className="flex gap-3">
                        <Link href="/dashboard/new-client" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium">
                            + Nuevo Cliente
                        </Link>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleClients.map(c => (
                    <div key={c.id} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-semibold text-gray-900">{c.company}</h2>
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(c.id, c.company)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm"
                                    title="Eliminar cliente"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <p>Plan: <span className="font-medium text-gray-800">{c.planBase}</span></p>
                            <p>Estado: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>{c.status}</span></p>
                        </div>
                        <Link
                            href={`/dashboard/clients/${c.id}`}
                            className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                        >
                            Ver progreso
                        </Link>
                    </div>
                ))}
                {visibleClients.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-10">No hay clientes con tareas asignadas.</p>
                )}
            </div>
        </div>
    )
}
