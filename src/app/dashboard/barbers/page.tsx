"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Barber {
  id: string;
  name: string;
  specialties: string;
  commission: number;
  user_id: string;
}

export default function BarbersPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("barbers")
        .select("*");

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      toast.error("Error al cargar los barberos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este barbero?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("barbers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Barbero eliminado exitosamente");
      setBarbers(barbers.filter(barber => barber.id !== id));
    } catch (error) {
      toast.error("Error al eliminar el barbero");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Barberos</h1>
        <button
          onClick={() => router.push("/dashboard/barbers/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Barbero
        </button>
      </div>

      {barbers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay barberos registrados</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barbers.map((barber) => (
                <tr key={barber.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{barber.specialties}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{barber.commission}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/barbers/${barber.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(barber.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}