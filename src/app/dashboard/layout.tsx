"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      setUserName(session.user.email || '')
      setLoading(false)
    } catch (error) {
      toast.error('Error de autenticación')
      router.push('/login')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
      ? 'bg-gray-900 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800">
        <div className="mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-white font-bold text-xl">
                  Barbershop
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/appointments"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/appointments')}`}
                >
                  Citas
                </Link>
                <Link
                  href="/dashboard/barbers"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/barbers')}`}
                >
                  Barberos
                </Link>
                <Link
                  href="/dashboard/services"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/services')}`}
                >
                  Servicios
                </Link>
              </div>
            </div>
            <div className="hidden md:flex md:items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <Link
                  href="/dashboard/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/profile')}`}
                >
                  Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6">
        {children}
      </main>
    </div>
  )
}