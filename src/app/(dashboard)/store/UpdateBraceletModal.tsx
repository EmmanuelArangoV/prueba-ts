"use client";

import { useState } from "react";
import { useBraceletContext } from "@/src/context/BraceletContext";
import type { Bracelet } from "@/generated/prisma/client";

interface UpdateBraceletModalProps {
  bracelet: Bracelet;
  onClose: () => void;
}

export function UpdateBraceletModal({ bracelet, onClose }: UpdateBraceletModalProps) {
  const { updateBracelet } = useBraceletContext();

  const [name, setName] = useState(bracelet.name);
  const [description, setDescription] = useState(bracelet.description || "");
  const [price, setPrice] = useState(bracelet.price.toString());
  const [stock, setStock] = useState(bracelet.stock.toString());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setError("");
    setIsLoading(true);
    setSuccess(false);

    try {
      await updateBracelet(bracelet.id, {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });
      setSuccess(true);
      setTimeout(() => {
         onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err ?? "Error desconocido");
      setError(msg || "Error al actualizar la manilla.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Actualizar Manilla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isLoading}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl relative text-sm">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 text-green-700 font-medium">
               ¡Manilla actualizada correctamente!
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {!success && (
           <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium text-sm hover:text-gray-900 transition mr-2">
               Cancelar
             </button>
             <button
               onClick={handleUpdate}
               disabled={isLoading}
               className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg shadow-sm transition"
             >
               {isLoading ? "Actualizando..." : "Actualizar"}
             </button>
           </div>
        )}
      </div>
    </div>
  );
}

