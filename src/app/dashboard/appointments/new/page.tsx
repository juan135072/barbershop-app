'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Barber {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    notes: '',
    barber_id: '',
    service_id: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchBarbers()
    fetchServices()
  }, [])

  const fetchBarbers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('barbers')
        .select('id, name')

      if (error) throw error
      setBarbers(data || [])
    } catch (error) {
      toast.error('Error al cargar barberos')
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      toast.error('Error al cargar servicios')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('appointments')
        .insert([formData])

      if (error) throw error

      toast.success('Cita creada exitosamente')
      router.push('/dashboard/appointments')
    } catch (error) {
      toast.error('Error al crear la cita')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nueva Cita</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Fecha</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Hora</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Nombre del Cliente</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
              type="tel"
              name="client_phone"
              value={formData.client_phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="client_email"
              value={formData.client_email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Barbero</label>
            <select
              name="barber_id"
              value={formData.barber_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Seleccionar barbero</option>
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Servicio</label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-1">Notas</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Cita'}
        </button>
      </form>
    </div>
  )
}