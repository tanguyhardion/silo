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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Parc */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#67726A]">
            Valeur du Parc Agricole
          </span>
          <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
            <Scale className="h-4.5 w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {formatCurrency(totalEstimatedValue)}
          </div>
          <p className="mt-1 text-xs text-[#67726A]">
            Cote consolidée des actifs
          </p>
        </div>
      </div>

      {/* Matériels Actifs */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#67726A]">
            Biens & Matériels
          </span>
          <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
            <Tractor className="h-4.5 w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalProducts}
          </div>
          <p className="mt-1 text-xs text-[#67726A]">
            Tracteurs, outils et équipements
          </p>
        </div>
      </div>

      {/* Preuves archivées */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#67726A]">
            Preuves Marché Réelles
          </span>
          <div className="rounded-xl bg-[#F6EFE2] p-2 text-[#995E15] border border-[#E9DCBF]">
            <BookmarkCheck className="h-4.5 w-4.5 text-[#C87D20]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalListings}
          </div>
          <p className="mt-1 text-xs text-[#67726A]">
            Annonces observées et archivées
          </p>
        </div>
      </div>

      {/* Traçabilité */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-5.5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#67726A]">
            Historique & Actes
          </span>
          <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
            <ShieldCheck className="h-4.5 w-4.5 text-[#213B2F]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-[#1E2721]">
            {totalValuations}
          </div>
          <p className="mt-1 text-xs text-[#67726A]">
            Valorisations enregistrées au registre
          </p>
        </div>
      </div>
    </div>
  );
}
