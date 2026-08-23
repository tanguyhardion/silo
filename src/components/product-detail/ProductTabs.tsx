import { FileCheck, History, ShieldCheck } from "lucide-react";

export type ProductTabType = "listings" | "history" | "audit";

interface ProductTabsProps {
  activeTab: ProductTabType;
  onTabChange: (tab: ProductTabType) => void;
  listingsCount: number;
  valuationsCount: number;
  auditLogsCount: number;
}

export function ProductTabs({
  activeTab,
  onTabChange,
  listingsCount,
  valuationsCount,
  auditLogsCount,
}: ProductTabsProps) {
  return (
    <div className="border-b border-[#DFD9CC]">
      <div className="flex gap-8 overflow-x-auto">
        <button
          onClick={() => onTabChange("listings")}
          className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "listings"
              ? "border-[#213B2F] text-[#213B2F]"
              : "border-transparent text-[#67726A] hover:text-[#1E2721]"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Annonces & Preuves ({listingsCount})</span>
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "history"
              ? "border-[#213B2F] text-[#213B2F]"
              : "border-transparent text-[#67726A] hover:text-[#1E2721]"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Historique des Valeurs ({valuationsCount})</span>
        </button>

        <button
          onClick={() => onTabChange("audit")}
          className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "audit"
              ? "border-[#213B2F] text-[#213B2F]"
              : "border-transparent text-[#67726A] hover:text-[#1E2721]"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Traçabilité & Journal ({auditLogsCount})</span>
        </button>
      </div>
    </div>
  );
}
