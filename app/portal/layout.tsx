'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [client, setClient] = useState<{ name: string, id: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.error || data.type !== 'client') {
                    router.push('/login')
                } else {
                    setClient(data)
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [router])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 h-20 px-8 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">R</div>
                    <div>
                        <span className="font-black text-gray-900 text-xl tracking-tight">Raffüss Portal</span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Client Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{client?.name || 'Cliente'}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Cuenta Activa</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-400">
                        {(client?.name || 'C').charAt(0)}
                    </div>
                    <Link
                        href="/api/auth?logout=true"
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                        Salir
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                {children}
            </main>

            <footer className="p-8 text-center text-gray-400 text-xs">
                © 2026 Raffüss Agency. Panel de Control de Cliente.
            </footer>
        </div>
    )
}
