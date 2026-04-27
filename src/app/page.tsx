"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/src/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.role === "ADMIN") {
          router.replace("/admin/transactions");
        } else {
          router.replace("/store");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex items-center gap-2 text-stone-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando...</span>
      </div>
    </div>
  );
}

