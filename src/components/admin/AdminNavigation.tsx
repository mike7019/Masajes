'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui'
import { NotificacionesRealTime } from './NotificacionesRealTime'

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/reservas', label: 'Reservas', icon: '📅' },
    { href: '/admin/disponibilidad', label: 'Horarios', icon: '🕒' },
    { href: '/admin/mensajes', label: 'Mensajes', icon: '💬' },
    { href: '/admin/estadisticas', label: 'Estadísticas', icon: '📊' },
    { href: '/admin/emails', label: 'Emails', icon: '📧' },
    { href: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
]

export function AdminNavigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    const handleLogout = () => {
        signOut({ callbackUrl: '/' })
    }

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/admin" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-spa-primary rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold spa-text-primary">
                            Admin Panel
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {adminNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-spa-primary px-3 py-2 rounded-md',
                                    pathname === item.href
                                        ? 'text-spa-primary bg-spa-primary/10'
                                        : 'text-gray-600'
                                )}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block text-sm text-gray-600">
                            {session?.user?.name || session?.user?.email}
                        </div>

                        {/* Notificaciones */}
                        <NotificacionesRealTime />

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/">Ver Sitio</Link>
                            </Button>

                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Salir
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="lg:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {isMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="lg:hidden py-4 border-t">
                        <div className="flex flex-col space-y-2">
                            {adminNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-3 text-sm font-medium transition-colors hover:text-spa-primary px-3 py-2 rounded-md',
                                        pathname === item.href
                                            ? 'text-spa-primary bg-spa-primary/10'
                                            : 'text-gray-600'
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}