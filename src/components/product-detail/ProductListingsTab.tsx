"use client";

import { useState } from "react";
import { Listing } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  Calendar,
  ExternalLink,
  FileCheck,
  MapPin,
  Plus,
  User,
  Pencil,
  Check,
  X,
  Loader2,
  FileText,
  Gauge,
} from "lucide-react";

interface ProductListingsTabProps {
  productId?: string;
  listings: Listing[];
  onAddListing: () => void;
  onUpdate?: () => void;
}

export function ProductListingsTab({
  productId,
  listings,
  onAddListing,
  onUpdate,
}: ProductListingsTabProps) {
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string>("");
  const [savingListingId, setSavingListingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startEditing = (listing: Listing) => {
    setEditingListingId(listing.id);
    setEditingNote(listing.notes || "");
    setErrorMessage(null);
  };

  const cancelEditing = () => {
    setEditingListingId(null);
    setEditingNote("");
    setErrorMessage(null);
  };

  const handleSaveNote = async (listingId: string) => {
    if (!productId) return;
    setSavingListingId(listingId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/products/${productId}/listings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          notes: editingNote.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la mise à jour de la note.");
      }

      setEditingListingId(null);
      setEditingNote("");
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setSavingListingId(null);
    }
  };

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
          className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-2xs hover:bg-[#2C4E3E] transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
          <span>Coller une URL</span>
        </button>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => {
            const isEditing = editingListingId === listing.id;
            const isSaving = savingListingId === listing.id;

            return (
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
                    {listing.publishedDate && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C7D6B]">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#8C7D6B]" />
                        <span>Publiée par l&apos;annonceur le {listing.publishedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Specs & Characteristics (Heures, Km, Année, Puissance, etc.) */}
                  {listing.specs && Object.keys(listing.specs).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(listing.specs).map(([key, val]) => {
                        if (!val || (typeof val !== "string" && typeof val !== "number")) return null;
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-[#EBE7DD]/80 border border-[#DFD9CC] text-[#3D4740]"
                          >
                            <span className="text-[#67726A]">{key} :</span>
                            <span className="font-semibold text-[#1E2721]">{String(val)}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Note d'analyse section */}
                  <div className="mt-3.5">
                    {isEditing ? (
                      <div className="rounded-xl border border-[#213B2F]/30 bg-[#F7F5F0] p-3 space-y-2.5 shadow-2xs animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#213B2F] flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-[#C87D20]" />
                            <span>Note d&apos;analyse :</span>
                          </label>
                          <span className="text-[10px] text-[#67726A]">
                            Ctrl+Entrée pour valider
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={editingNote}
                          autoFocus
                          onChange={(e) => setEditingNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSaveNote(listing.id);
                            } else if (e.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                          placeholder="Expliquez la pertinence de cette preuve (ex: état d'usure identique, options équivalentes, décote observée...)"
                          className="w-full rounded-lg border border-[#DFD9CC] bg-white p-2.5 text-xs text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
                        />

                        {errorMessage && (
                          <p className="text-[11px] text-red-600 font-medium">{errorMessage}</p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#DFD9CC] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#67726A] hover:bg-[#EBE7DD] transition-colors"
                          >
                            <X className="h-3 w-3" />
                            <span>Annuler</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(listing.id)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#213B2F] px-3 py-1.5 text-xs font-bold text-[#F4F6F1] shadow-2xs hover:bg-[#2C4E3E] disabled:opacity-50 transition-colors"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Enregistrement...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 text-[#E0AF62]" />
                                <span>Enregistrer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : listing.notes ? (
                      <div className="group/note relative rounded-xl bg-[#F7F5F0] p-3 text-xs text-[#213B2F] border border-[#DFD9CC] transition-all hover:border-[#C8BFAD]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <strong className="font-bold text-[#1E2721] block mb-0.5">
                              Note d&apos;analyse :
                            </strong>
                            <p className="text-[#3D4740] whitespace-pre-wrap leading-relaxed">
                              {listing.notes}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditing(listing)}
                            title="Modifier la note d'analyse"
                            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#213B2F] border border-[#DFD9CC] hover:bg-[#EBE7DD] hover:border-[#C8BFAD] transition-all shadow-2xs"
                          >
                            <Pencil className="h-2.5 w-2.5 text-[#C87D20]" />
                            <span>Modifier</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(listing)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#DFD9CC] bg-[#F7F5F0]/50 py-2.5 px-3 text-xs font-semibold text-[#67726A] hover:border-[#213B2F]/40 hover:bg-[#EBE7DD]/60 hover:text-[#213B2F] transition-all group/btn"
                      >
                        <Pencil className="h-3 w-3 text-[#C87D20] group-hover/btn:scale-110 transition-transform" />
                        <span>Ajouter une note d&apos;analyse</span>
                      </button>
                    )}
                  </div>

                  {/* Photos */}
                  {listing.images && listing.images.length > 0 && (
                    <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1">
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
                <div className="mt-4 border-t border-[#EDE9DF] pt-3 flex items-center justify-end">
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
            );
          })}
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

