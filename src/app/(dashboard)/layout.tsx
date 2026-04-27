"use client";

import { useAuthContext } from "@/src/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Cargando...</div>;
  }

  const isAdmin = user?.role === "ADMIN";

  const navigation = isAdmin
    ? [
        { name: "Transacciones", href: "/transactions" },
        { name: "Manillas", href: "/store" },
      ]
    : [
        { name: "Tienda", href: "/store" },
        { name: "Mis Compras", href: "/transactions" },
      ];

  return (
    <div className="flex h-screen bg-[#fdfdf7]">
      <aside className="w-64 border-r border-stone-200 bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-stone-200">
          <span className="font-bold text-xl text-red-600 tracking-tight">HorusPay</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-stone-200">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-stone-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full font-medium">
              {isAdmin ? "ADMIN" : "CLIENTE"}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex justify-center items-center px-4 py-2 border border-stone-300 rounded-lg shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-stone-50">
        <div className="mx-auto max-w-5xl py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

