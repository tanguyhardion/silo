import { useState } from "react";
import { Product } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Pencil, Plus, Scale, ZoomIn } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";

interface ProductHeroProps {
  product: Product;
  avgListingPrice: number | null;
  validPricesCount: number;
  onOpenEditProduct: () => void;
  onOpenValuationModal: () => void;
  onOpenListingModal: () => void;
}

export function ProductHero({
  product,
  avgListingPrice,
  validPricesCount,
  onOpenEditProduct,
  onOpenValuationModal,
  onOpenListingModal,
}: ProductHeroProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const heroImage =
    product.mainImageUrl ||
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80";

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-[#DFD9CC] bg-[#FCFBF8] shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image Cover */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="group relative aspect-16/9 lg:aspect-auto lg:col-span-5 overflow-hidden bg-[#EAE6DC] cursor-pointer"
            title="Cliquer pour agrandir l'image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all pointer-events-none" />

            {/* Discreet visible zoom icon */}
            <div className="absolute top-4 right-4 rounded-lg bg-black/60 p-1.5 text-white shadow-xs backdrop-blur-2xs group-hover:bg-[#213B2F] transition-colors pointer-events-none">
              <ZoomIn className="h-4 w-4 text-white/90 group-hover:text-white" />
            </div>

            <div className="absolute top-4 left-4">
              <span className="rounded-lg bg-[#213B2F]/90 px-3 py-1 text-xs font-semibold text-[#F4F6F1] backdrop-blur-md border border-[#3D6652]/40">
                {product.type}
              </span>
            </div>

            {/* Edit Product Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditProduct();
              }}
              title="Modifier le bien"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FCFBF8]/95 px-3 py-2 text-xs font-bold text-[#1E2721] shadow-md backdrop-blur-md border border-[#DFD9CC] hover:bg-[#213B2F] hover:text-[#F4F6F1] transition-all"
            >
              <Pencil className="h-4 w-4 text-[#C87D20]" />
              <span>Modifier le bien</span>
            </button>
          </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#C87D20]">
                    Fiche d&apos;Évaluation & Preuves
                  </span>
                  <span className="text-xs text-[#A8B3AC]">•</span>
                  <span className="text-xs text-[#67726A]">
                    Enregistré le {formatDate(product.createdAt)}
                  </span>
                  {product.status === "archived" && (
                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                      Archivé
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E2721]">
                  {product.name}
                </h1>
              </div>

              <button
                onClick={onOpenEditProduct}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] px-3 py-2 text-xs font-bold text-[#1E2721] shadow-2xs hover:bg-[#EBE7DD] transition-all shrink-0"
                title="Modifier les informations du bien"
              >
                <Pencil className="h-3.5 w-3.5 text-[#C87D20]" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            </div>

            {product.description && (
              <p className="mt-3 text-sm leading-relaxed text-[#505A53]">
                {product.description}
              </p>
            )}
          </div>

          {/* Valuation Banner & Call to Action */}
          <div className="mt-6 rounded-2xl bg-[#F7F5F0] p-5 border border-[#DFD9CC]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7D8880]">
                  Valeur Estimée Retenue
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#213B2F]">
                    {product.currentEstimatedValue
                      ? formatCurrency(product.currentEstimatedValue, product.currency)
                      : "- €"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#67726A]">
                  <Calendar className="h-3.5 w-3.5 text-[#C87D20]" />
                  <span>
                    Dernière valorisation :{" "}
                    <strong className="font-bold text-[#1E2721]">
                      {product.lastValuationDate || "Aujourd'hui"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={onOpenValuationModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 text-[#E0AF62]" />
                  <span>Nouvelle valeur</span>
                </button>
                <button
                  onClick={onOpenListingModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#213B2F] bg-[#FCFBF8] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#213B2F] shadow-2xs hover:bg-[#EBE7DD] active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter preuve</span>
                </button>
              </div>
            </div>

            {avgListingPrice && (
              <div className="mt-3.5 border-t border-[#DFD9CC] pt-3 flex items-center justify-between text-xs">
                <span className="text-[#67726A] flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-[#C87D20]" />
                  Moyenne observée ({validPricesCount} annonces) :
                </span>
                <span className="text-base font-bold text-[#1E2721]">
                  {formatCurrency(avgListingPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      <ImageLightbox
        images={[heroImage]}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={product.name}
      />
    </>
  );
}
