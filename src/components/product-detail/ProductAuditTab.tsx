import { ActivityLog } from "@/types";
import { ShieldCheck, User } from "lucide-react";

interface ProductAuditTabProps {
  activityLogs: ActivityLog[];
}

export function ProductAuditTab({ activityLogs }: ProductAuditTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#EBE7DD]/70 p-4.5 rounded-2xl border border-[#DFD9CC]">
        <h3 className="text-base font-bold text-[#1E2721]">
          Journal de traçabilité
        </h3>
        <p className="text-xs text-[#67726A]">
          Historique complet des actes répondant à : « Pourquoi ce bien était-il valorisé à ce montant à cette date ? »
        </p>
      </div>

      {activityLogs.length > 0 ? (
        <div className="relative border-l-2 border-[#DFD9CC] ml-4 space-y-6 py-2">
          {activityLogs.map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-[#FCFBF8] bg-[#213B2F]" />

              <div className="rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs font-bold text-[#1E2721]">
                    {log.description}
                  </span>
                  <span className="text-[11px] text-[#67726A]">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-[#67726A]">
                  <User className="h-3.5 w-3.5 text-[#C87D20]" />
                  <span>
                    Par :{" "}
                    <strong className="text-[#1E2721] font-semibold">
                      {log.actor}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFD9CC] bg-[#FCFBF8] p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-[#67726A]" />
          <h4 className="mt-2 text-base font-bold text-[#1E2721]">
            Aucune activité enregistrée
          </h4>
          <p className="mt-1 text-xs text-[#67726A] max-w-md mx-auto">
            Les actions futures d&apos;estimation et d&apos;ajout de preuves seront tracées ici.
          </p>
        </div>
      )}
    </div>
  );
}
