"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function NewBarberPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialties: "",
    commission: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/login");
        return;
      }

      // Primero, crear el usuario
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: generateRandomPassword(),
        email_confirm: true,
        user_metadata: {
          name: formData.name
        }
      });

      if (userError) throw userError;

      // Luego, crear el barbero asociado al usuario
      const { error: barberError } = await supabase
        .from("barbers")
        .insert([
          {
            user_id: userData.user.id,
            name: formData.name,
            specialties: formData.specialties,
            commission: parseFloat(formData.commission)
          }
        ]);

      if (barberError) throw barberError;

      toast.success("Barbero creado exitosamente");
      router.push("/dashboard/barbers");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el barbero");
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

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nuevo Barbero</h1>
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
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
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
          {loading ? "Creando..." : "Crear Barbero"}
        </button>
      </form>
    </div>
  );
}