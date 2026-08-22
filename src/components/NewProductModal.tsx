"use client";

import { useState } from "react";
import { ProductType } from "@/types";
import { X, Wheat, AlertCircle } from "lucide-react";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRODUCT_TYPES: ProductType[] = [
  "Tracteur",
  "Moissonneuse-batteuse",
  "Outil de travail du sol",
  "Semoir / Planteuse",
  "Pulvérisateur",
  "Épandeur",
  "Remorque / Benne",
  "Manutention / Télescopique",
  "Véhicule utilitaire / 4x4",
  "Autre",
];

export function NewProductModal({ isOpen, onClose, onSuccess }: NewProductModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("Tracteur");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [initialValuationNotes, setInitialValuationNotes] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du bien est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: type === "Autre" && customType.trim() ? customType.trim() : type,
          customType: type === "Autre" ? customType.trim() : null,
          description: description.trim() || null,
          currentEstimatedValue: parseFloat(initialValue) || 0,
          mainImageUrl: mainImageUrl.trim() || null,
          initialValuationNotes: initialValuationNotes.trim() || "Valorisation initiale lors de la création du bien.",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#FCFBF8] p-6 shadow-2xl border border-[#DFD9CC] sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD9CC] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
              <Wheat className="h-5 w-5 text-[#E0AF62]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2721]">
                Enregistrer un nouveau bien
              </h2>
              <p className="text-xs text-[#67726A]">
                Ajout d&apos;un matériel au patrimoine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#67726A] hover:bg-[#EBE7DD] hover:text-[#1E2721] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Nom du bien *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: John Deere 6155R, Fendt 724..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none focus:ring-1 focus:ring-[#213B2F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Catégorie *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none focus:ring-1 focus:ring-[#213B2F]"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Type if Autre */}
          {type === "Autre" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Précisez la catégorie *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Drone d'épandage, Chariot élévateur, Cuve à fioul..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Description (optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="Description générale, état, équipements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
            />
          </div>

          {/* Initial Value */}
          <div className="rounded-2xl bg-[#F7F5F0] p-4.5 border border-[#DFD9CC] space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C87D20]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#213B2F]">
                Première estimation de valeur
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#67726A]">
                  Valeur estimée (€)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    step="100"
                    placeholder="Ex: 42000"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value)}
                    className="w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 pr-8 text-base font-bold text-[#213B2F] focus:border-[#213B2F] focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-[#67726A]">
                    €
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#67726A]">
                  Justification / Note initiale
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prix d'achat, argus..."
                  value={initialValuationNotes}
                  onChange={(e) => setInitialValuationNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              URL d&apos;une photo principale (optionnel)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFD9CC]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DFD9CC] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#67726A] hover:bg-[#EBE7DD] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#213B2F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Enregistrement..." : "Enregistrer le bien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
