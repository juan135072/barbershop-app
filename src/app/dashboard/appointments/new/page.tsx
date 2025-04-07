"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Barber {
  id: string;
  user: {
    name: string;
  };
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersResponse, servicesResponse] = await Promise.all([
          fetch("/api/barbers"),
          fetch("/api/services"),
        ]);

        if (!barbersResponse.ok || !servicesResponse.ok) {
          throw new Error("Error al cargar los datos");
        }

        const [barbersData, servicesData] = await Promise.all([
          barbersResponse.json(),
          servicesResponse.json(),
        ]);

        setBarbers(barbersData);
        setServices(servicesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al cargar los datos");
      }
    };

    fetchData();
  }, []);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
    if (service) {
      generateAvailableTimes(service.duration);
    }
  };

  const generateAvailableTimes = (duration: number) => {
    const times = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM
    const interval = 30; // 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        times.push(time);
      }
    }

    setAvailableTimes(times);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const startTime = formData.get("startTime") as string;
    const duration = selectedService?.duration || 0;

    // Calcular hora de fin basada en la duración del servicio
    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

    const data = {
      date: formData.get("date"),
      startTime,
      endTime,
      clientName: formData.get("clientName"),
      clientPhone: formData.get("clientPhone"),
      clientEmail: formData.get("clientEmail"),
      notes: formData.get("notes"),
      barberId: formData.get("barberId"),
      serviceId: formData.get("serviceId"),
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la cita");
      }

      router.push("/dashboard/appointments");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Cita</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="barberId" className="block text-sm font-medium text-gray-700">
            Barbero
          </label>
          <select
            id="barberId"
            name="barberId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona un barbero</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
            Servicio
          </label>
          <select
            id="serviceId"
            name="serviceId"
            required
            onChange={(e) => handleServiceChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona un servicio</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.duration} min)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Hora
          </label>
          <select
            id="startTime"
            name="startTime"
            required
            disabled={!selectedService}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona una hora</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
            Nombre del Cliente
          </label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">
            Teléfono del Cliente
          </label>
          <input
            type="tel"
            id="clientPhone"
            name="clientPhone"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
            Email del Cliente (opcional)
          </label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Cita"}
          </button>
        </div>
      </form>
    </div>
  );
} 