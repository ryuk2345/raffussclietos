'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TeamMember {
    id: string
    name: string
    role: string
    email?: string
    status: 'Activo' | 'Inactivo'
}

export default function UnifiedTeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        status: 'Activo' as 'Activo' | 'Inactivo',
        passwordHash: ''
    })

    const fetchMembers = async () => {
        const res = await fetch('/api/team')
        const data = await res.json()
        setMembers(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = { ...formData, name: formData.name.trim(), email: formData.email.trim() }

        if (editingMember) {
            await fetch(`/api/team/${editingMember.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            })
        } else {
            await fetch('/api/team', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
        }

        setShowModal(false)
        setEditingMember(null)
        setFormData({ name: '', role: '', email: '', status: 'Activo', passwordHash: '' })
        fetchMembers()
    }

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member)
        setFormData({
            name: member.name,
            role: member.role,
            email: member.email || '',
            status: member.status,
            passwordHash: (member as any).passwordHash || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este integrante? Esto también revocará su acceso al sistema.')) return
        await fetch(`/api/team/${id}`, { method: 'DELETE' })
        fetchMembers()
    }

    const roleColors: Record<string, string> = {
        'Admin': 'bg-red-100 text-red-700',
        'Diseñador': 'bg-pink-100 text-pink-700',
        'Trafficker': 'bg-blue-100 text-blue-700',
        'Dev': 'bg-green-100 text-green-700',
        'Community Manager': 'bg-orange-100 text-orange-700',
    }

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-black rounded-full border-t-transparent"></div></div>

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Equipo y Accesos</h1>
                    <p className="text-gray-500">Gestiona los integrantes y sus permisos de acceso</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMember(null)
                        setFormData({ name: '', role: '', email: '', status: 'Activo', passwordHash: '' })
                        setShowModal(true)
                    }}
                    className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-sm font-bold flex items-center gap-2"
                >
                    <span>+</span> Añadir Integrante
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-50">
                                    {member.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{member.name}</h3>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${roleColors[member.role] || 'bg-gray-100 text-gray-700'}`}>
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${member.status === 'Activo' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}>
                                {member.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {member.email && (
                                <p className="text-xs text-gray-500 flex items-center gap-2 font-medium">
                                    <span className="opacity-50">📧</span>
                                    {member.email}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                {member.email ? '✓ Acceso habilitado' : '⚠ Sin acceso (falta email)'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(member)}
                                className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition text-xs font-black uppercase tracking-widest border border-gray-100"
                            >
                                Gestionar
                            </button>
                            <button
                                onClick={() => handleDelete(member.id)}
                                className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition text-xs font-black uppercase tracking-widest border border-red-100"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                        <div className="text-5xl mb-4">👥</div>
                        <p className="text-gray-400 font-black uppercase tracking-widest">No hay integrantes.</p>
                        <p className="text-gray-300 text-xs mt-1">Comienza añadiendo al primer miembro de tu equipo.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 overflow-hidden relative">
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-1 text-gray-900 uppercase tracking-tight">
                                {editingMember ? 'Editar Perfil' : 'Nuevo Integrante'}
                            </h2>
                            <p className="text-gray-500 text-sm mb-8 font-medium">Configure los detalles y el nivel de acceso.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 ring-blue-500/10 outline-none transition-all font-bold text-gray-800"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cargo / Rol</label>
                                        <select
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option>Admin</option>
                                            <option>Diseñador</option>
                                            <option>Trafficker</option>
                                            <option>Dev</option>
                                            <option>Community Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as 'Activo' | 'Inactivo' })}
                                        >
                                            <option>Activo</option>
                                            <option>Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Empresarial</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 ring-blue-500/10 outline-none transition-all font-bold text-gray-800"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ejemplo@raffuss.com"
                                    />
                                    <p className="mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Este email servirá para iniciar sesión en el OS.</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña de Acceso</label>
                                    <input
                                        type="text"
                                        className="w-full bg-blue-50/50 border border-blue-100 p-3 rounded-xl focus:ring-2 ring-blue-500/10 outline-none transition-all font-bold text-blue-600"
                                        value={formData.passwordHash}
                                        onChange={e => setFormData({ ...formData, passwordHash: e.target.value })}
                                        placeholder="Min. 6 caracteres"
                                    />
                                    <p className="mt-1 text-[9px] text-blue-400 font-bold uppercase tracking-tighter">Deja vacío para mantener la actual o '123456' por defecto.</p>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 text-gray-400 hover:text-gray-600 transition text-xs font-black uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all text-xs font-black uppercase tracking-widest"
                                    >
                                        {editingMember ? 'Actualizar' : 'Crear Acceso'}
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
