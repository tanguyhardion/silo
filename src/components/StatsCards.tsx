import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Package, ShieldCheck, History } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6960]">
            Valeur du Parc
          </span>
          <div className="rounded-xl bg-[#E8EAE2] p-2.5 text-[#1C3F30]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-[#18201B]">
            {formatCurrency(totalEstimatedValue)}
          </div>
          <p className="mt-1 text-xs text-[#5C6960]">
            Cote globale actuelle consolidée
          </p>
        </div>
      </div>

      {/* Matériels Actifs */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6960]">
            Biens & Matériels
          </span>
          <div className="rounded-xl bg-[#E8EAE2] p-2.5 text-[#1C3F30]">
            <Package className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-[#18201B]">
            {totalProducts}
          </div>
          <p className="mt-1 text-xs text-[#5C6960]">
            Tracteurs, machines et équipements
          </p>
        </div>
      </div>

      {/* Preuves / Annonces enregistrées */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6960]">
            Preuves de Marché
          </span>
          <div className="rounded-xl bg-[#FEF3C7] p-2.5 text-[#92400E]">
            <span className="font-bold text-xs">LBC / AGRI</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-[#18201B]">
            {totalListings}
          </div>
          <p className="mt-1 text-xs text-[#5C6960]">
            Annonces observées et horodatées
          </p>
        </div>
      </div>

      {/* Historique d'estimations */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5C6960]">
            Traçabilité & Historique
          </span>
          <div className="rounded-xl bg-[#E8EAE2] p-2.5 text-[#1C3F30]">
            <History className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-[#18201B]">
            {totalValuations}
          </div>
          <p className="mt-1 text-xs text-[#5C6960]">
            Valorisations certifiées au journal
          </p>
        </div>
      </div>
    </div>
  );
}
