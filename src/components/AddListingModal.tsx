"use client";

import { useState } from "react";
import { getTodayFormatted } from "@/lib/utils";
import {
  X,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { ScrapedListingData } from "@/types";

interface AddListingModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddListingModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: AddListingModalProps) {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedListingData | null>(null);
  const [source, setSource] = useState<"leboncoin" | "agriaffaires" | "autre">("agriaffaires");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [location, setLocation] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [observedAt, setObservedAt] = useState(getTodayFormatted());
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successScrapeMsg, setSuccessScrapeMsg] = useState(false);

  if (!isOpen) return null;

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Veuillez coller une URL Leboncoin ou Agriaffaires.");
      return;
    }

    setScraping(true);
    setError(null);
    setSuccessScrapeMsg(false);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Impossible d'extraire les données automatiquement.");
      }

      const info: ScrapedListingData = data.data;
      setScrapedData(info);
      setSource(info.source);
      setTitle(info.title || "");
      if (info.price && info.price > 0) setPrice(info.price.toString());
      setSellerName(info.sellerName || "");
      setLocation(info.location || "");
      setPublishedDate(info.publishedDate || getTodayFormatted());
      setDescription(info.description || "");
      setImages(info.images || []);
      setSuccessScrapeMsg(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      setError("L'URL et le titre de l'annonce sont requis.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          url: url.trim(),
          title: title.trim(),
          price: parseFloat(price) || 0,
          currency: "EUR",
          sellerName: sellerName.trim() || null,
          sellerType: source === "agriaffaires" ? "pro" : "particulier",
          location: location.trim() || null,
          publishedDate: publishedDate.trim() || null,
          observedAt: observedAt.trim() || getTodayFormatted(),
          description: description.trim() || null,
          specs: scrapedData?.specs || {},
          images: images.length > 0 ? images : [],
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FCFBF8] p-6 shadow-2xl border border-[#DFD9CC] sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD9CC] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE7DD] p-2 text-[#213B2F] border border-[#DFD9CC]">
              <FileCheck className="h-5 w-5 text-[#C87D20]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2721]">
                Archiver une preuve de marché
              </h2>
              <p className="text-xs text-[#67726A]">
                Leboncoin ou Agriaffaires — {productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#67726A] hover:bg-[#EBE7DD] hover:text-[#1E2721] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* URL Input & Instant Scraper */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
              Collez l&apos;URL de l&apos;annonce (Agriaffaires ou Leboncoin) *
            </label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#67726A]">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.agriaffaires.com/... ou https://www.leboncoin.fr/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD9CC] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleScrape}
                disabled={scraping || !url}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-xs hover:bg-[#2C4E3E] disabled:opacity-50 transition-all shrink-0 active:scale-95"
              >
                {scraping ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Extraction...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5 text-[#E0AF62]" />
                    <span>Extraire la preuve</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#67726A]">
              Silo récupère automatiquement le prix, les photos, le vendeur, la localisation et la date.
            </p>
          </div>

          {successScrapeMsg && (
            <div className="rounded-xl bg-[#3D7A5D]/10 border border-[#3D7A5D]/30 p-3.5 text-xs text-[#213B2F] space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3D7A5D]" />
                <span className="font-semibold">
                  Données d&apos;annonce extraites avec succès !
                </span>
              </div>
              {scrapedData?.specs && Object.keys(scrapedData.specs).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(scrapedData.specs).map(([key, val]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 rounded-md bg-white/80 border border-[#3D7A5D]/20 px-2 py-0.5 text-[11px] font-medium text-[#213B2F]"
                    >
                      <span className="text-[#67726A]">{key}:</span>
                      <strong>{String(val)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form details */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#DFD9CC]">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Titre de l&apos;annonce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: John Deere 6155R..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
              />
            </div>

            {/* Price & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Prix observé (€) *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="Ex: 98000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 pr-8 text-base font-bold text-[#213B2F] focus:border-[#213B2F] focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-[#67726A]">
                    €
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Plateforme source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as "leboncoin" | "agriaffaires" | "autre")}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
                >
                  <option value="agriaffaires">Agriaffaires</option>
                  <option value="leboncoin">Leboncoin</option>
                  <option value="autre">Autre plateforme</option>
                </select>
              </div>
            </div>

            {/* Seller & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Vendeur (Concessionnaire ou particulier)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Agri Centre 37, M. Dupont..."
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Localisation
                </label>
                <input
                  type="text"
                  placeholder="Ex: 37 - Indre-et-Loire"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
                />
              </div>
            </div>

            {/* Observation Date & Publication Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Date d&apos;observation (Preuve horodatée) *
                </label>
                <input
                  type="text"
                  required
                  value={observedAt}
                  onChange={(e) => setObservedAt(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                  Date de publication originale
                </label>
                <input
                  type="text"
                  placeholder="JJ/MM/AAAA"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2 text-sm text-[#1E2721] focus:border-[#213B2F] focus:outline-none"
                />
              </div>
            </div>

            {/* Note / Analysis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
                Note d&apos;analyse (Commentaire de comparaison)
              </label>
              <textarea
                rows={2}
                placeholder="Pourquoi cette preuve est-elle pertinente ? (Ex: Même gamme d'options, bon point de comparaison...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DFD9CC] bg-white p-3 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
              />
            </div>

            {/* Images preview */}
            {images.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A] mb-1.5">
                  Photos archivées pour la preuve ({images.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-[#DFD9CC]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Preuve" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD9CC]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#DFD9CC] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#67726A] hover:bg-[#EBE7DD] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#213B2F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] disabled:opacity-50 transition-all active:scale-95"
              >
                {submitting ? "Enregistrement..." : "Archiver la preuve"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
