"use client";

import Link from "next/link";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, FileText, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.mainImageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-md"
    >
      {/* Image & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EBECE5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            {product.type}
          </span>
        </div>

        {/* Listings / Preuves count badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1C3F30] shadow-xs backdrop-blur-md">
            <FileText className="h-3 w-3" />
            <span>{product.listingsCount || 0} {product.listingsCount === 1 ? "preuve" : "preuves"}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#18201B] transition-colors group-hover:text-[#1C3F30]">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-2 text-xs leading-relaxed text-[#5C6960] line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom / Value & Date */}
        <div className="mt-5 border-t border-[#F0F2ED] pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#5C6960]">
                Valeur estimée
              </span>
              <div className="text-xl font-extrabold text-[#1C3F30]">
                {formatCurrency(product.currentEstimatedValue, product.currency)}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-[11px] text-[#5C6960]">
                <Calendar className="h-3 w-3" />
                <span>{product.lastValuationDate || "Non renseigné"}</span>
              </div>
              <span className="mt-0.5 inline-flex items-center text-xs font-semibold text-[#1C3F30] group-hover:underline">
                Détails <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
