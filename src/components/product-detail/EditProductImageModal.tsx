import { useState, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { ProductImagePicker } from "@/components/ProductImagePicker";

interface EditProductImageModalProps {
  productId: string;
  productName: string;
  currentImageUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductImageModal({
  productId,
  productName,
  currentImageUrl,
  isOpen,
  onClose,
  onSuccess,
}: EditProductImageModalProps) {
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setImageUrlInput(currentImageUrl || "");
      setImageError(null);
    }
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageSaving(true);
    setImageError(null);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainImageUrl: imageUrlInput.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Impossible de mettre à jour la photo.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setImageError((err as Error).message);
    } finally {
      setImageSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FCFBF8] p-6 shadow-2xl border border-[#DFD9CC] sm:p-8">
        <div className="flex items-center justify-between border-b border-[#DFD9CC] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
              <ImageIcon className="h-5 w-5 text-[#C87D20]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2721]">
                {currentImageUrl ? "Modifier la photo" : "Ajouter une photo"}
              </h2>
              <p className="text-xs text-[#67726A]">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#67726A] hover:bg-[#EBE7DD] hover:text-[#1E2721] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveImage} className="mt-6 space-y-4">
          {imageError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          <ProductImagePicker
            value={imageUrlInput}
            onChange={setImageUrlInput}
            queryHint={productName}
            label="Source de la photo"
            onError={setImageError}
          />

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
              disabled={imageSaving}
              className="rounded-xl bg-[#213B2F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] disabled:opacity-50 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{imageSaving ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

