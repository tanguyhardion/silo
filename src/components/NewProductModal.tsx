"use client";

import { useState } from "react";
import { ProductType } from "@/types";
import { X, Sparkles, AlertCircle } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E5DC] sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#18201B]">
              Ajouter un nouveau bien
            </h2>
            <p className="mt-0.5 text-xs text-[#5C6960]">
              Enregistrez un bien ou matériel dans votre parc Silo
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#5C6960] hover:bg-[#F0F2ED] hover:text-[#18201B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B]">
                Nom du bien *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: John Deere 6155R, Fendt 724..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none focus:ring-1 focus:ring-[#1C3F30]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B]">
                Type de bien *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none focus:ring-1 focus:ring-[#1C3F30]"
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
              <label className="block text-xs font-semibold text-[#18201B]">
                Précisez le type *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Drone d'épandage, Chariot élévateur, Cuve à fioul..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              Description (optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="Description générale, état, options ou remarques..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
            />
          </div>

          {/* Initial Value & Reason */}
          <div className="rounded-xl bg-[#F8FAF7] p-4 border border-[#E2E5DC] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D78A2E]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C3F30]">
                Première estimation de valeur
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Valeur estimée (€)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    step="100"
                    placeholder="Ex: 42000"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 pr-8 text-sm font-bold text-[#1C3F30] focus:border-[#1C3F30] focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-sm font-semibold text-[#5C6960]">
                    €
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#18201B]">
                  Justification / Note initiale
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prix d'achat, argus..."
                  value={initialValuationNotes}
                  onChange={(e) => setInitialValuationNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              URL d&apos;une photo principale (optionnel)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E5DC]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#5C6960] hover:bg-[#F0F2ED] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#1C3F30] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#25523F] disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Création en cours..." : "Créer le bien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
