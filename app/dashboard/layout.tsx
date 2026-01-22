'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [user, setUser] = useState<{ name: string, role: string } | null>(null)

    const navItems = [
        { name: 'Clientes', href: '/dashboard', icon: '🏢' },
        { name: 'Gestión de Equipo', href: '/dashboard/team', icon: '👥' },
        { name: 'Equipo y Usuarios', href: '/dashboard/members', icon: '🧑‍💻' },
        { name: 'Servicios', href: '/dashboard/services', icon: '📦' },
    ]

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setUser(data)
            })
            .catch(err => console.error('Error fetching user:', err))
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile/Tablet Header with Toggle */}
            <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                    <span className="font-bold text-gray-800">Raffüss OS</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-lg">
                    ☰
                </button>
            </div>

            {/* Sidebar (Desktop: Collapsible, Mobile: Modal/Dropdown style) */}
            <aside
                className={`
                fixed md:sticky top-0 h-screen bg-white border-r border-gray-200 z-20 transition-all duration-300
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
            `}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center h-20">
                    <div className={`flex items-center gap-3 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">R</div>
                        <span className="font-bold text-gray-800 text-lg whitespace-nowrap">Raffüss OS</span>
                    </div>
                    {/* Desktop Toggle Button inside sidebar */}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 text-gray-500">
                        {isSidebarOpen ? '«' : '»'}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.name}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap overflow-hidden ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="text-xl shrink-0">{item.icon}</span>
                                <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
                    <div className={`flex items-center gap-3 px-2 py-2 overflow-hidden transition-all ${isSidebarOpen ? '' : 'justify-center'}`}>
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className={`text-sm transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                            <p className="font-bold text-gray-900 whitespace-nowrap truncate max-w-[120px]">{user?.name || 'Cargando...'}</p>
                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">{user?.role || 'Autenticando'}</p>
                            <Link href="/api/auth?logout=true" className="text-indigo-500 text-[11px] font-bold hover:text-indigo-700 whitespace-nowrap mt-1 block">Cerrar Sesión</Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 w-full overflow-x-hidden">
                {children}
            </div>

        </div>
    )
}
