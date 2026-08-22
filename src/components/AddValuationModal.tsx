"use client";

import { useState } from "react";
import { getTodayFormatted } from "@/lib/utils";
import { X, Calendar, AlertCircle, Scale } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FCFBF8] p-6 shadow-2xl border border-[#DFD9CC] sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD9CC] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
              <Scale className="h-5 w-5 text-[#213B2F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2721]">
                Enregistrer une valorisation
              </h2>
              <p className="text-xs text-[#67726A] truncate max-w-xs sm:max-w-sm">
                {productName}
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Value (€) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Valeur estimée (€) *
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                step="50"
                required
                autoFocus
                placeholder="Ex: 42000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 pr-8 text-base font-bold text-[#213B2F] focus:border-[#213B2F] focus:outline-none focus:ring-1 focus:ring-[#213B2F]"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-[#67726A]">
                €
              </span>
            </div>
          </div>

          {/* Date (Auto-filled today) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Date d&apos;observation *
              </label>
              <span className="text-[10px] text-[#213B2F] font-bold bg-[#EBE7DD] px-2 py-0.5 rounded border border-[#DFD9CC]">
                Date du jour automatique
              </span>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#67726A]">
                <Calendar className="h-4 w-4 text-[#C87D20]" />
              </div>
              <input
                type="text"
                required
                value={valuationDate}
                onChange={(e) => setValuationDate(e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full rounded-xl border border-[#DFD9CC] bg-white pl-9 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes / Justification */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Note justificative (optionnelle)
            </label>
            <div className="relative mt-1.5">
              <textarea
                rows={3}
                placeholder="Pourquoi cette valeur ? (Ex: Basé sur 2 annonces Agriaffaires de modèles similaires, révision effectuée...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-[#DFD9CC] bg-white p-3 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#67726A]">
              Cette note sera enregistrée dans l&apos;historique du bien.
            </p>
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Auteur de l&apos;estimation
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD9CC]">
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
              {loading ? "Enregistrement..." : "Enregistrer la valeur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
