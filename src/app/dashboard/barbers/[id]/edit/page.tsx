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

export default function EditBarberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [barber, setBarber] = useState<Barber | null>(null);

  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const response = await fetch(`/api/barbers/${params.id}`);
        if (!response.ok) {
          throw new Error("Error al cargar el barbero");
        }
        const data = await response.json();
        setBarber(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al cargar el barbero");
      }
    };

    fetchBarber();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      specialties: formData.get("specialties")?.toString().split(",").map(s => s.trim()),
      commission: parseFloat(formData.get("commission") as string),
    };

    try {
      const response = await fetch(`/api/barbers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el barbero");
      }

      router.push("/dashboard/barbers");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al actualizar el barbero");
    } finally {
      setLoading(false);
    }
  };

  if (!barber) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Barbero</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={barber.user.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={barber.user.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">
            Especialidades (separadas por comas)
          </label>
          <input
            type="text"
            id="specialties"
            name="specialties"
            required
            defaultValue={barber.specialties.join(", ")}
            placeholder="Ej: Corte de cabello, Afeitado, Tinte"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="commission" className="block text-sm font-medium text-gray-700">
            Comisión (%)
          </label>
          <input
            type="number"
            id="commission"
            name="commission"
            required
            min="0"
            max="100"
            step="0.01"
            defaultValue={barber.commission}
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
            {loading ? "Actualizando..." : "Actualizar Barbero"}
          </button>
        </div>
      </form>
    </div>
  );
} 