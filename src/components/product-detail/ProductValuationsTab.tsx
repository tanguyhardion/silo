import { Valuation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, History, Plus } from "lucide-react";

interface ProductValuationsTabProps {
  valuations: Valuation[];
  onAddValuation: () => void;
}

export function ProductValuationsTab({
  valuations,
  onAddValuation,
}: ProductValuationsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#EBE7DD]/70 p-4.5 rounded-2xl border border-[#DFD9CC]">
        <div>
          <h3 className="text-base font-bold text-[#1E2721]">
            Historique des estimations
          </h3>
          <p className="text-xs text-[#67726A]">
            Toutes les valorisations enregistrées sont conservées dans le temps.
          </p>
        </div>
        <button
          onClick={onAddValuation}
          className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-2xs hover:bg-[#2C4E3E]"
        >
          <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
          <span>Enregistrer une valeur</span>
        </button>
      </div>

      {valuations.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] shadow-xs">
          <table className="min-w-full divide-y divide-[#DFD9CC] text-left text-xs">
            <thead className="bg-[#F7F5F0] font-bold uppercase tracking-wider text-[#67726A]">
              <tr>
                <th className="px-6 py-3.5">Date d&apos;estimation</th>
                <th className="px-6 py-3.5">Valeur</th>
                <th className="px-6 py-3.5">Justification & Notes</th>
                <th className="px-6 py-3.5">Auteur</th>
                <th className="px-6 py-3.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE9DF]">
              {valuations.map((val, idx) => (
                <tr key={val.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-[#1E2721]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#C87D20]" />
                      <span>{val.valuationDate}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-base font-extrabold text-[#213B2F]">
                    {formatCurrency(val.value)}
                  </td>
                  <td className="px-6 py-4 text-[#505A53] max-w-xs sm:max-w-md leading-relaxed">
                    {val.notes || <span className="italic text-[#99A39D]">Aucune note</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1E2721]">
                    {val.createdBy}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {idx === 0 ? (
                      <span className="rounded-full bg-[#3D7A5D]/15 border border-[#3D7A5D]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#213B2F]">
                        Valeur Actuelle
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EBE7DD] px-2.5 py-0.5 text-[10px] font-medium text-[#67726A]">
                        Historique
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFD9CC] bg-[#FCFBF8] p-10 text-center">
          <History className="mx-auto h-8 w-8 text-[#67726A]" />
          <h4 className="mt-2 text-base font-bold text-[#1E2721]">
            Aucune estimation enregistrée
          </h4>
          <p className="mt-1 text-xs text-[#67726A] max-w-md mx-auto">
            Définissez une première valeur estimée pour ce matériel.
          </p>
          <button
            onClick={onAddValuation}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-xs hover:bg-[#2C4E3E] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
            <span>Enregistrer une valeur</span>
          </button>
        </div>
      )}
    </div>
  );
}
