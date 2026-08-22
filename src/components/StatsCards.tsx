import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Tractor, Scale, BookmarkCheck } from "lucide-react";

interface StatsCardsProps {
  totalProducts: number;
  totalEstimatedValue: number;
  totalListings: number;
  totalValuations: number;
}

export function StatsCards({
  totalProducts,
  totalEstimatedValue,
  totalListings,
  totalValuations,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Total Parc */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-3 sm:p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#67726A] truncate">
            Valeur du Parc
          </span>
          <div className="rounded-lg sm:rounded-xl bg-[#EBE7DD] p-1.5 sm:p-2 text-[#213B2F] border border-[#DFD9CC] shrink-0">
            <Scale className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-3">
          <div className="text-lg sm:text-3xl font-extrabold tracking-tight text-[#1E2721] truncate">
            {formatCurrency(totalEstimatedValue)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10.5px] sm:text-xs text-[#67726A] line-clamp-1">
            Cote consolidée des actifs
          </p>
        </div>
      </div>

      {/* Matériels Actifs */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-3 sm:p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#67726A] truncate">
            Biens & Matériels
          </span>
          <div className="rounded-lg sm:rounded-xl bg-[#EBE7DD] p-1.5 sm:p-2 text-[#213B2F] border border-[#DFD9CC] shrink-0">
            <Tractor className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-3">
          <div className="text-lg sm:text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalProducts}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10.5px] sm:text-xs text-[#67726A] line-clamp-1">
            Tracteurs & équipements
          </p>
        </div>
      </div>

      {/* Preuves archivées */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-3 sm:p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#67726A] truncate">
            Preuves Marché
          </span>
          <div className="rounded-lg sm:rounded-xl bg-[#F6EFE2] p-1.5 sm:p-2 text-[#995E15] border border-[#E9DCBF] shrink-0">
            <BookmarkCheck className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#C87D20]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-3">
          <div className="text-lg sm:text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalListings}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10.5px] sm:text-xs text-[#67726A] line-clamp-1">
            Annonces observées
          </p>
        </div>
      </div>

      {/* Traçabilité */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-3 sm:p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#67726A] truncate">
            Historique & Actes
          </span>
          <div className="rounded-lg sm:rounded-xl bg-[#EBE7DD] p-1.5 sm:p-2 text-[#213B2F] border border-[#DFD9CC] shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-3">
          <div className="text-lg sm:text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalValuations}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10.5px] sm:text-xs text-[#67726A] line-clamp-1">
            Valorisations enregistrées
          </p>
        </div>
      </div>
    </div>
  );
}
