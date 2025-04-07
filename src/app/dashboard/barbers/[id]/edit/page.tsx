"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Barber {
  id: string;
  name: string;
  specialties: string;
  commission: number;
}

export default function EditBarberPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    specialties: "",
    commission: ""
  });

  useEffect(() => {
    if (params.id) {
      fetchBarber(params.id as string);
    }
  }, [params.id]);

  const fetchBarber = async (id: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || "",
          specialties: data.specialties || "",
          commission: data.commission?.toString() || ""
        });
      }
    } catch (error) {
      toast.error("Error al cargar datos del barbero");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("barbers")
        .update({
          name: formData.name,
          specialties: formData.specialties,
          commission: parseFloat(formData.commission)
        })
        .eq("id", params.id);

      if (error) throw error;

      toast.success("Barbero actualizado exitosamente");
      router.push("/dashboard/barbers");
    } catch (error) {
      toast.error("Error al actualizar el barbero");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading && !formData.name) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Barbero</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Especialidades</label>
          <textarea
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1">Comisión (%)</label>
          <input
            type="number"
            name="commission"
            value={formData.commission}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            max="100"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}