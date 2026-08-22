"use client";

import { useState } from "react";
import { getTodayFormatted } from "@/lib/utils";
import { X, Calendar, DollarSign, FileText, AlertCircle } from "lucide-react";

interface AddValuationModalProps {
  productId: string;
  productName: string;
  currentValue: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddValuationModal({
  productId,
  productName,
  currentValue,
  isOpen,
  onClose,
  onSuccess,
}: AddValuationModalProps) {
  const [value, setValue] = useState(currentValue ? currentValue.toString() : "");
  const [valuationDate, setValuationDate] = useState(getTodayFormatted());
  const [notes, setNotes] = useState("");
  const [createdBy, setCreatedBy] = useState("Tanguy (Gérant)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(parseFloat(value))) {
      setError("Veuillez saisir une valeur numérique valide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}/valuations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: parseFloat(value),
          valuationDate: valuationDate.trim(),
          notes: notes.trim() || null,
          createdBy: createdBy.trim() || "Utilisateur Silo",
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E5DC] sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#18201B]">
              Enregistrer une valorisation
            </h2>
            <p className="mt-0.5 text-xs text-[#5C6960] truncate max-w-xs sm:max-w-sm">
              {productName}
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Value (€) */}
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              Valeur estimée (€) *
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6960]">
                <DollarSign className="h-4 w-4" />
              </div>
              <input
                type="number"
                step="50"
                required
                autoFocus
                placeholder="Ex: 42000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] pl-9 pr-8 py-2.5 text-base font-bold text-[#1C3F30] focus:border-[#1C3F30] focus:outline-none focus:ring-1 focus:ring-[#1C3F30]"
              />
              <span className="absolute right-3.5 top-2.5 text-sm font-semibold text-[#5C6960]">
                €
              </span>
            </div>
          </div>

          {/* Date (Auto-filled today) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#18201B]">
                Date d&apos;observation / valorisation *
              </label>
              <span className="text-[11px] text-[#1C3F30] font-medium bg-[#E8EAE2] px-2 py-0.5 rounded">
                Saisie automatique (date du jour)
              </span>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6960]">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={valuationDate}
                onChange={(e) => setValuationDate(e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full rounded-xl border border-[#CBD5E1] pl-9 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes / Justification */}
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              Note justificative (optionnelle mais recommandée)
            </label>
            <div className="relative mt-1.5">
              <textarea
                rows={3}
                placeholder="Pourquoi cette valeur ? Ex: Basé sur 2 annonces Agriaffaires récentes en 6m, révision moteur effectuée..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#5C6960]">
              Cette note restera gravée dans l&apos;historique immuable de ce bien.
            </p>
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              Auteur de l&apos;estimation
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E5DC]">
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
              {loading ? "Enregistrement..." : "Enregistrer la valeur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
