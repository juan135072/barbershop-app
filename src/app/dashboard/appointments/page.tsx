"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  barber: {
    user: {
      name: string;
    };
  };
  service: {
    name: string;
    price: number;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        if (!response.ok) {
          throw new Error("Error al cargar las citas");
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el estado");
      }

      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: newStatus }
          : appointment
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al actualizar el estado");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Citas</h1>
        <button
          onClick={() => router.push("/dashboard/appointments/new")}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nueva Cita
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Calendario</h2>
          {/* Aquí irá el componente de calendario */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500">Calendario en desarrollo</p>
          </div>
        </div>

        {/* Lista de citas del día */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Citas para {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          <div className="space-y-4">
            {appointments
              .filter(appointment => 
                format(new Date(appointment.date), "yyyy-MM-dd") === 
                format(selectedDate, "yyyy-MM-dd")
              )
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(appointment => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{appointment.clientName}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.barber.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.service.name} - ${appointment.service.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(appointment.id, "CONFIRMED")}
                          className="text-green-600 hover:text-green-900 text-sm"
                          disabled={appointment.status === "CONFIRMED"}
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, "CANCELLED")}
                          className="text-red-600 hover:text-red-900 text-sm"
                          disabled={appointment.status === "CANCELLED"}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, "COMPLETED")}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          disabled={appointment.status === "COMPLETED"}
                        >
                          Completar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {appointments.filter(appointment => 
              format(new Date(appointment.date), "yyyy-MM-dd") === 
              format(selectedDate, "yyyy-MM-dd")
            ).length === 0 && (
              <p className="text-center text-gray-500">No hay citas para este día</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 