"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Barber {
  id: string;
  user: {
    name: string;
    email: string;
  };
  specialties: string[];
  commission: number;
}

export default function BarbersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch("/api/barbers");
        if (!response.ok) {
          throw new Error("Error al cargar los barberos");
        }
        const data = await response.json();
        setBarbers(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al cargar los barberos");
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este barbero?")) {
      return;
    }

    try {
      const response = await fetch(`/api/barbers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el barbero");
      }

      setBarbers(barbers.filter(barber => barber.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al eliminar el barbero");
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
        <h1 className="text-2xl font-bold">Barberos</h1>
        <button
          onClick={() => router.push("/dashboard/barbers/new")}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Barbero
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {barbers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay barberos registrados</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {barbers.map((barber) => (
              <li key={barber.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {barber.user.name}
                      </p>
                      <p className="text-sm text-gray-500">{barber.user.email}</p>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          Especialidades: {barber.specialties.join(", ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Comisión: {barber.commission}%
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/barbers/${barber.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(barber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 