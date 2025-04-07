"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointments: 0,
    barbers: 0,
    services: 0
  })

  useEffect(() => {
    checkSession()
    fetchStats()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
      setLoading(false)
    } catch (error) {
      console.error('Error al verificar sesión:', error)
      router.push('/login')
    }
  }

  const fetchStats = async () => {
    try {
      const [appointmentsResult, barbersResult, servicesResult] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('barbers').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true })
      ])

      setStats({
        appointments: appointmentsResult.count || 0,
        barbers: barbersResult.count || 0,
        services: servicesResult.count || 0
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Citas</h2>
          <p className="text-3xl font-bold mt-2">{stats.appointments}</p>
          <Link 
            href="/dashboard/appointments" 
            className="block mt-4 text-blue-500 hover:text-blue-700"
          >
            Ver todas →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Barberos</h2>
          <p className="text-3xl font-bold mt-2">{stats.barbers}</p>
          <Link 
            href="/dashboard/barbers" 
            className="block mt-4 text-blue-500 hover:text-blue-700"
          >
            Ver todos →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Servicios</h2>
          <p className="text-3xl font-bold mt-2">{stats.services}</p>
          <Link 
            href="/dashboard/services" 
            className="block mt-4 text-blue-500 hover:text-blue-700"
          >
            Ver todos →
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/appointments/new"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
          >
            Nueva Cita
          </Link>
          <Link
            href="/dashboard/barbers/new"
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center"
          >
            Nuevo Barbero
          </Link>
          <Link
            href="/dashboard/services/new"
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-center"
          >
            Nuevo Servicio
          </Link>
        </div>
      </div>
    </div>
  )
}