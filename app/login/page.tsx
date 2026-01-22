'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            if (res.ok) {
                const data = await res.json()
                router.push(data.redirectTo || '/dashboard')
            } else {
                const data = await res.json()
                setError(data.error || 'Login fallido')
            }
        } catch (err) {
            setError('Ocurrió un error')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Raffüss ClientOS</h1>
                <p className="text-center text-gray-500 mb-6 font-medium">Ingresa tus credenciales</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border-gray-100 border-2 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-900"
                            placeholder="tu@empresa.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-sm font-bold text-gray-700">Contraseña / Clave</label>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Opcional para clientes</span>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border-gray-100 border-2 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-900"
                            placeholder="••••••••"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed px-1">
                            <strong>Admin:</strong> usa tu clave maestra.<br />
                            <strong>Cliente:</strong> solo necesitas ingresar el correo registrado en tu contrato.
                        </p>
                    </div>
                    {error && <p className="text-red-500 text-xs font-black bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all font-black uppercase tracking-widest text-sm"
                    >
                        Entrar al Sistema
                    </button>
                    <div className="pt-2 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Operations Console v2.0</p>
                    </div>
                </form>
            </div>
        </div>
    )
}
