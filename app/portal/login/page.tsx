'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientLoginPage() {
    const router = useRouter()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const res = await fetch('/api/portal/login', {
            method: 'POST',
            body: JSON.stringify({ accessCode: code })
        })

        if (res.ok) {
            const data = await res.json()
            router.push(`/portal/${data.clientId}`)
        } else {
            setError('Código de acceso inválido')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Acceso a Clientes</h1>
                    <p className="text-gray-500 mt-2">Ingresa tu código único para ver tu progreso.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Código de Acceso (ej: v8x2k1)"
                            className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-xl p-4 uppercase focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition transform active:scale-95">
                        Ingresar al Portal
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">Protected by Raffüss ClientOS</p>
                </form>
            </div>
        </div>
    )
}
