"use client";

import { useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register({ email, password, firstName, lastName });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Error al crear tu cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-stone-900 tracking-tight">HorusPay</h2>
        <p className="mt-2 text-sm text-stone-600">Crea tu cuenta cliente</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Nombre</label>
            <input
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Apellido</label>
            <input
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded">{error}</div>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-red-600 hover:text-red-500 hover:underline">
            ¿Ya tienes cuenta? Ingresa aquí
          </Link>
        </div>
      </form>
    </>
  );
}


