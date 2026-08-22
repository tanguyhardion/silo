import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  Link2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

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
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const isUploaded = currentImageUrl?.startsWith("data:") ?? false;
      setImageInputMode(isUploaded || !currentImageUrl ? "upload" : "url");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError("L'image ne doit pas dépasser 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrlInput(event.target?.result as string);
        setImageError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Source de la photo
              </label>
              <div className="flex rounded-lg bg-[#EBE7DD] p-0.5 border border-[#DFD9CC]">
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                    imageInputMode === "upload"
                      ? "bg-[#FCFBF8] text-[#213B2F] shadow-2xs"
                      : "text-[#67726A] hover:text-[#1E2721]"
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  <span>Importer un fichier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                    imageInputMode === "url"
                      ? "bg-[#FCFBF8] text-[#213B2F] shadow-2xs"
                      : "text-[#67726A] hover:text-[#1E2721]"
                  }`}
                >
                  <Link2 className="h-3 w-3" />
                  <span>Lien URL</span>
                </button>
              </div>
            </div>

            {imageInputMode === "upload" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DFD9CC] bg-[#F7F5F0] p-5 hover:border-[#213B2F] hover:bg-[#EBE7DD]/60 transition-all text-center"
                >
                  <Upload className="h-6 w-6 text-[#C87D20]" />
                  <p className="mt-2 text-xs font-bold text-[#1E2721]">
                    Cliquez pour choisir une photo depuis votre appareil
                  </p>
                  <p className="mt-1 text-[11px] text-[#67726A]">
                    PNG, JPG, WebP jusqu&apos;à 5 Mo
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrlInput.startsWith("data:") ? "" : imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
                />
                <p className="mt-1.5 text-[11px] text-[#67726A]">
                  Laissez vide pour réinitialiser et utiliser l&apos;illustration par défaut.
                </p>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {imageUrlInput && (
            <div className="relative rounded-2xl border border-[#DFD9CC] bg-[#F7F5F0] p-3 flex items-center gap-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[#EAE6DC] border border-[#DFD9CC]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrlInput}
                  alt="Aperçu"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#1E2721] block truncate">
                  Photo prête à enregistrer
                </span>
                <span className="text-[11px] text-[#67726A]">
                  {imageUrlInput.startsWith("data:") ? "Fichier importé" : "Lien Web"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="rounded-xl border border-[#DFD9CC] p-2 text-[#C87D20] hover:bg-[#EBE7DD] hover:text-red-600 transition-colors"
                title="Supprimer la photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

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
