'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        company: '',
        contactName: '',
        email: '',
        planBase: 'Started',
        status: 'Activo',
        driveFolder: '',
        billingCycle: '30',
        password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch('/api/clients', {
            method: 'POST',
            body: JSON.stringify(form)
        })
        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="p-10 min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Registrar Nuevo Cliente</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa *</label>
                        <input
                            required
                            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Ej: TechVision Inc."
                            value={form.company}
                            onChange={e => setForm({ ...form, company: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contacto Principal</label>
                        <input
                            className="w-full border p-2.5 rounded-lg"
                            placeholder="Ej: Juan Pérez"
                            value={form.contactName}
                            onChange={e => setForm({ ...form, contactName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2.5 rounded-lg"
                            placeholder="nombre@empresa.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Contratado *</label>
                        <select
                            className="w-full border p-2.5 rounded-lg bg-white font-bold text-gray-800"
                            value={form.planBase}
                            onChange={e => setForm({ ...form, planBase: e.target.value })}
                        >
                            <option value="Started">Plan Started (Básico)</option>
                            <option value="Growth">Plan Growth (Intermedio)</option>
                            <option value="Scale">Plan Scale (Avanzado)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            className="w-full border p-2.5 rounded-lg bg-white"
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <option>Activo</option>
                            <option>En Pausa</option>
                            <option>Finalizado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo de Renovación</label>
                        <select
                            className="w-full border p-2.5 rounded-lg bg-white font-bold text-blue-600"
                            value={form.billingCycle}
                            onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                        >
                            <option value="15">Quincenal (15 días)</option>
                            <option value="30">Mensual (30 días)</option>
                            <option value="45">45 días</option>
                            <option value="60">Bimensual (60 días)</option>
                            <option value="90">Trimestral (3 meses)</option>
                            <option value="180">Semestral (6 meses)</option>
                            <option value="365">Anual (1 año)</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link de Carpeta Drive (Entregables)</label>
                        <input
                            className="w-full border p-2.5 rounded-lg text-blue-600 underline-offset-2"
                            placeholder="https://drive.google.com/..."
                            value={form.driveFolder}
                            onChange={e => setForm({ ...form, driveFolder: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Este link se mostrará en el perfil del cliente para acceder a sus archivos.</p>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso para el cliente (Portal)</label>
                        <input
                            required
                            className="w-full border p-2.5 rounded-lg font-bold text-blue-600"
                            placeholder="Mínimo 6 caracteres"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                        <p className="text-xs text-gray-400 mt-1 italic">El cliente usará su correo y esta contraseña para ver sus avances.</p>
                    </div>

                    <div className="flex gap-3 mt-4 col-span-2">
                        <Link href="/dashboard" className="w-1/2 py-3 text-center border rounded-lg hover:bg-gray-50 font-medium transition">Cancelar</Link>
                        <button type="submit" className="w-1/2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">Guardar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
