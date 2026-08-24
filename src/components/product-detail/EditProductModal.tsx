"use client";

import { useState, useEffect } from "react";
import { Product, ProductType } from "@/types";
import {
  AlertCircle,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { ProductImagePicker } from "@/components/ProductImagePicker";

interface EditProductModalProps {
  product: Product;
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

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const isKnownType = PRODUCT_TYPES.includes(product.type as ProductType);
  const initialCategoryType: ProductType = isKnownType
    ? (product.type as ProductType)
    : "Autre";

  const [name, setName] = useState(product.name || "");
  const [type, setType] = useState<ProductType>(initialCategoryType);
  const [customType, setCustomType] = useState(
    product.customType || (!isKnownType ? product.type : "")
  );
  const [description, setDescription] = useState(product.description || "");
  const [status, setStatus] = useState<"active" | "archived">(
    product.status || "active"
  );

  const [mainImageUrl, setMainImageUrl] = useState(product.mainImageUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const isKnown = PRODUCT_TYPES.includes(product.type as ProductType);
      setName(product.name || "");
      setType(isKnown ? (product.type as ProductType) : "Autre");
      setCustomType(product.customType || (!isKnown ? product.type : ""));
      setDescription(product.description || "");
      setStatus(product.status || "active");
      setMainImageUrl(product.mainImageUrl || "");
      setError(null);
    }
  }, [isOpen, product]);

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
      const finalType =
        type === "Autre" && customType.trim() ? customType.trim() : type;

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: finalType,
          customType: type === "Autre" ? customType.trim() : null,
          description: description.trim() || null,
          status,
          mainImageUrl: mainImageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Impossible de mettre à jour le bien.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FCFBF8] shadow-2xl border border-[#DFD9CC] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD9CC] px-6 py-5 sm:px-8 shrink-0 bg-[#FCFBF8]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
              <Pencil className="h-5 w-5 text-[#C87D20]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2721]">
                Modifier le bien
              </h2>
              <p className="text-xs text-[#67726A]">
                Mettre à jour les informations et la photo du matériel
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 my-2 space-y-4">
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
              placeholder="Description générale, état, équipements, historique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Statut du bien
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "archived")}
              className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
            >
              <option value="active">Actif (en patrimoine)</option>
              <option value="archived">Archivé / Vendu</option>
            </select>
          </div>

          {/* Photo Input (Web Suggestions, Upload, or URL) */}
          <div className="pt-2">
            <ProductImagePicker
              value={mainImageUrl}
              onChange={setMainImageUrl}
              queryHint={name}
              label="Photo principale du matériel"
              onError={setError}
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] disabled:opacity-50 transition-all active:scale-95"
            >
              <Check className="h-4 w-4 text-[#E0AF62]" />
              <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

