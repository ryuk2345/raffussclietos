'use client'
import { useEffect, useState } from 'react'

interface ServicePackage {
    id: string
    name: string
    description: string
    price: number
    features: string[]
    status: 'Activo' | 'Inactivo'
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServicePackage[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState<ServicePackage | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        features: [] as string[],
        status: 'Activo' as 'Activo' | 'Inactivo'
    })
    const [featureInput, setFeatureInput] = useState('')

    const fetchServices = async () => {
        const res = await fetch('/api/services')
        const data = await res.json()
        setServices(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (editingService) {
            await fetch(`/api/services/${editingService.id}`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            })
        } else {
            await fetch('/api/services', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
        }

        setShowModal(false)
        setEditingService(null)
        setFormData({ name: '', description: '', price: 0, features: [], status: 'Activo' })
        fetchServices()
    }

    const handleEdit = (service: ServicePackage) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            features: service.features,
            status: service.status
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este servicio?')) return
        await fetch(`/api/services/${id}`, { method: 'DELETE' })
        fetchServices()
    }

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData({
                ...formData,
                features: [...formData.features, featureInput.trim()]
            })
            setFeatureInput('')
        }
    }

    const removeFeature = (index: number) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index)
        })
    }

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-black rounded-full border-t-transparent"></div></div>

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Paquetes de Servicios</h1>
                    <p className="text-gray-500">Gestiona tus planes y servicios</p>
                </div>
                <button
                    onClick={() => {
                        setEditingService(null)
                        setFormData({ name: '', description: '', price: 0, features: [], status: 'Activo' })
                        setShowModal(true)
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium"
                >
                    + Crear Paquete
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-blue-200 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">${service.price.toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${service.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {service.status}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                        <div className="border-t pt-4 mb-4">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Incluye:</p>
                            <ul className="space-y-1">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay paquetes registrados. Crea el primero.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
                            {editingService ? 'Editar Paquete' : 'Nuevo Paquete'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paquete</label>
                                <input
                                    required
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Started, Growth, Scale"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe el paquete..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="1500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        className="flex-1 border p-2 rounded-lg"
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        placeholder="Ej: 3 publicaciones semanales"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {formData.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm">{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(idx)}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    className="w-full border p-2 rounded-lg bg-white"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Activo' | 'Inactivo' })}
                                >
                                    <option>Activo</option>
                                    <option>Inactivo</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    {editingService ? 'Guardar Cambios' : 'Crear Paquete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
