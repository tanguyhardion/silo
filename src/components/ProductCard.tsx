"use client";

import Link from "next/link";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, FileCheck, ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const coverImage =
    product.mainImageUrl ||
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C8BFAD] hover:shadow-md"
    >
      {/* Image & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EAE6DC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Category Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-lg bg-[#213B2F]/90 px-2.5 py-1 text-[11px] font-semibold text-[#F4F6F1] shadow-xs backdrop-blur-md border border-[#3D6652]/40">
            {product.type}
          </span>
        </div>

        {/* Proofs Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCFBF8]/95 px-2.5 py-1 text-[11px] font-bold text-[#213B2F] shadow-xs backdrop-blur-md border border-[#DFD9CC]">
            <FileCheck className="h-3.5 w-3.5 text-[#C87D20]" />
            <span>
              {product.listingsCount || 0}{" "}
              {product.listingsCount === 1 ? "preuve" : "preuves"}
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5.5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-snug text-[#1E2721] transition-colors group-hover:text-[#213B2F]">
              {product.name}
            </h3>
            <div className="rounded-full bg-[#EBE7DD] p-1 text-[#213B2F] opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {product.description && (
            <p className="mt-2 text-xs leading-relaxed text-[#67726A] line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom / Value & Date */}
        <div className="mt-5 border-t border-[#EDE9DF] pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7D8880]">
                Valeur Estimée
              </span>
              <div className="text-xl font-black tracking-tight text-[#213B2F]">
                {formatCurrency(product.currentEstimatedValue, product.currency)}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] text-[#67726A]">
                <Calendar className="h-3 w-3 text-[#C87D20]" />
                <span>{product.lastValuationDate || "Non daté"}</span>
              </div>
              <span className="mt-0.5 inline-block text-[11px] font-bold uppercase tracking-wider text-[#213B2F]">
                Consulter la fiche →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
