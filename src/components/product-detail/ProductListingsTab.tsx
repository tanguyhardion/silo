import { Listing } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Clock, ExternalLink, FileCheck, MapPin, Plus, User } from "lucide-react";

interface ProductListingsTabProps {
  listings: Listing[];
  onAddListing: () => void;
}

export function ProductListingsTab({
  listings,
  onAddListing,
}: ProductListingsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#EBE7DD]/70 p-4.5 rounded-2xl border border-[#DFD9CC]">
        <div>
          <h3 className="text-base font-bold text-[#1E2721]">
            Preuves de marché archivées (Leboncoin / Agriaffaires)
          </h3>
          <p className="text-xs text-[#67726A]">
            Chaque preuve est horodatée avec sa date d&apos;observation réelle pour justifier la cote du matériel.
          </p>
        </div>
        <button
          onClick={onAddListing}
          className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-2xs hover:bg-[#2C4E3E]"
        >
          <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
          <span>Coller une URL</span>
        </button>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] p-5 shadow-xs transition-all hover:border-[#C8BFAD] hover:shadow-sm"
            >
              {/* Top tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                      listing.source === "agriaffaires"
                        ? "bg-[#213B2F]/10 border-[#213B2F]/20 text-[#213B2F]"
                        : "bg-[#7A5B3E]/10 border-[#7A5B3E]/20 text-[#7A5B3E]"
                    }`}
                  >
                    {listing.source}
                  </span>
                  {listing.sellerType && (
                    <span className="rounded-md bg-[#EBE7DD] px-2 py-0.5 text-[10px] font-semibold text-[#505A53]">
                      {listing.sellerType === "pro" ? "Concessionnaire" : "Particulier"}
                    </span>
                  )}
                </div>

                {/* Observed Date */}
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F6EFE2] border border-[#E9DCBF] px-2.5 py-0.5 text-[11px] font-bold text-[#8C5413]">
                  <Clock className="h-3 w-3 text-[#C87D20]" />
                  <span>Observé le {listing.observedAt}</span>
                </span>
              </div>

              {/* Listing Title & Price */}
              <div className="mt-3 flex-1">
                <h4 className="text-base font-bold text-[#1E2721] line-clamp-2">
                  {listing.title}
                </h4>
                <div className="mt-1.5 text-2xl font-black text-[#213B2F]">
                  {formatCurrency(listing.price, listing.currency)}
                </div>

                {/* Location & Seller */}
                <div className="mt-2 space-y-1 text-xs text-[#67726A]">
                  {listing.sellerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0 text-[#C87D20]" />
                      <span>{listing.sellerName}</span>
                    </div>
                  )}
                  {listing.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C87D20]" />
                      <span>{listing.location}</span>
                    </div>
                  )}
                </div>

                {/* User Notes */}
                {listing.notes && (
                  <div className="mt-3 rounded-xl bg-[#F7F5F0] p-3 text-xs text-[#213B2F] border border-[#DFD9CC]">
                    <strong className="font-bold">Note d&apos;analyse :</strong> {listing.notes}
                  </div>
                )}

                {/* Photos */}
                {listing.images && listing.images.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {listing.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-[#DFD9CC]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt="Preuve"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom link */}
              <div className="mt-4 border-t border-[#EDE9DF] pt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#67726A]">
                  Publication : {listing.publishedDate || "Non précisée"}
                </span>
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#213B2F] hover:underline"
                >
                  <span>Consulter la source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFD9CC] bg-[#FCFBF8] p-10 text-center">
          <FileCheck className="mx-auto h-8 w-8 text-[#67726A]" />
          <h4 className="mt-2 text-base font-bold text-[#1E2721]">
            Aucune preuve archivée pour ce bien
          </h4>
          <p className="mt-1 text-xs text-[#67726A] max-w-md mx-auto">
            Collez des URLs Leboncoin ou Agriaffaires pour archiver des preuves de valeur horodatées.
          </p>
          <button
            onClick={onAddListing}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-xs hover:bg-[#2C4E3E] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
            <span>Ajouter une preuve</span>
          </button>
        </div>
      )}
    </div>
  );
}
