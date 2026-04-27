"use client";

import { useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group">
      <div className="text-center mb-2 transition-transform duration-300 group-focus-within:-translate-y-1">
        <h2 className="mt-6 text-3xl font-extrabold text-stone-900 tracking-tight">HorusPay</h2>
        <p className="mt-2 text-sm text-stone-600">Inicia sesión en tu cuenta</p>
      </div>

      <form className="mt-4 space-y-6 bg-[#fffdf7] p-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:-translate-y-1" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:z-10 sm:text-sm transition-shadow duration-150 shadow-sm"
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
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:z-10 sm:text-sm transition-shadow duration-150 shadow-sm"
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
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 disabled:opacity-50 transition-transform transform hover:-translate-y-0.5 shadow-md"
          >
            {isLoading ? "Iniciando..." : "Ingresar"}
          </button>
        </div>
        <div className="text-sm text-center">
          <Link href="/register" className="font-medium text-red-600 hover:text-red-500 hover:underline">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  );
}


