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
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">HorusPay</h2>
        <p className="mt-2 text-sm text-gray-600">Inicia sesión en tu cuenta</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              className="appearance-none rounded-lg block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-shadow shadow-sm"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="appearance-none rounded-lg block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-shadow shadow-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-red-700 text-sm font-medium text-center bg-red-100 p-3 rounded-lg border border-red-200">{error}</div>}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors shadow-md"
          >
            {isLoading ? "Iniciando..." : "Ingresar"}
          </button>
        </div>

        <div className="mt-4 text-sm text-center">
          <Link href="/register" className="font-semibold text-red-600 hover:text-red-500 hover:underline transition-colors">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  );
}
