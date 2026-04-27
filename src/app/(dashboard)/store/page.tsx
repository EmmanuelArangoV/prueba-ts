"use client";

import { useEffect, useState } from "react";
import { useBraceletContext } from "@/src/context/BraceletContext";
import { useTransactionContext } from "@/src/context/TransactionContext";
import { PaymentModal } from "./PaymentModal";
import type { Bracelet } from "@/generated/prisma/client";

export default function StorePage() {
  const { bracelets, fetchBracelets, isLoading } = useBraceletContext();
  const [selectedBracelet, setSelectedBracelet] = useState<Bracelet | null>(null);

  useEffect(() => {
    fetchBracelets();
  }, [fetchBracelets]);

  if (isLoading) return <div className="text-center py-10 text-stone-500">Cargando catálogo...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Catálogo de Manillas</h1>
        <p className="mt-2 text-stone-600 text-lg">Elige la manilla inteligente que más se adapte a ti.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bracelets.map((bracelet) => (
          <div
            key={bracelet.id}
            className="flex flex-col bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-stone-100 flex items-center justify-center p-4">
              {bracelet.imageUrl ? (
                <img src={bracelet.imageUrl} alt={bracelet.name} className="object-cover h-full" />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-red-200 border-dashed bg-red-50" />
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-stone-900">{bracelet.name}</h3>
              <p className="mt-1 text-sm text-stone-500 flex-1 line-clamp-3">
                {bracelet.description || "Sin descripción"}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-red-600">${Number(bracelet.price).toLocaleString()}</span>
                  <span className="text-xs text-stone-500 ml-1">{bracelet.currency}</span>
                </div>
                <div className="text-sm font-medium text-stone-500">
                  Stock: {bracelet.stock > 0 ? (
                    <span className="text-green-600">{bracelet.stock}</span>
                  ) : (
                    <span className="text-red-600">Agotado</span>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <button
                  disabled={bracelet.stock <= 0}
                  onClick={() => setSelectedBracelet(bracelet)}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {bracelet.stock > 0 ? "Comprar Ahora" : "No disponible"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bracelets.length === 0 && !isLoading && (
        <div className="text-center py-20 text-stone-500">
          <p>No hay manillas disponibles en este momento.</p>
        </div>
      )}

      {selectedBracelet && (
        <PaymentModal
          bracelet={selectedBracelet}
          onClose={() => setSelectedBracelet(null)}
        />
      )}
    </div>
  );
}

