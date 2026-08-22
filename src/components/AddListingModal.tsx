"use client";

import { useState } from "react";
import { getTodayFormatted } from "@/lib/utils";
import {
  X,
  Link as LinkIcon,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E5DC] sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                Preuve Marché
              </span>
              <h2 className="text-lg font-bold text-[#18201B]">
                Ajouter une annonce comparable
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#5C6960]">
              Leboncoin ou Agriaffaires — {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#5C6960] hover:bg-[#F0F2ED] hover:text-[#18201B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* URL Input & Instant Scraper */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#18201B]">
              Collez l&apos;URL de l&apos;annonce (Leboncoin ou Agriaffaires) *
            </label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6960]">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.leboncoin.fr/... ou https://www.agriaffaires.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] pl-9 pr-3 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleScrape}
                disabled={scraping || !url}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#25523F] disabled:opacity-50 transition-all shrink-0 active:scale-95"
              >
                {scraping ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Extraction...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Extraire les données</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#5C6960]">
              Silo récupère automatiquement le prix, les photos, le vendeur, la date et les caractéristiques techniques.
            </p>
          </div>

          {successScrapeMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Informations extraites avec succès ! Vérifiez et complétez les détails ci-dessous avant d&apos;enregistrer.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form details (editable) */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#F0F2ED]">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#18201B]">
                Titre de l&apos;annonce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: John Deere 6155R AutoPower TLS..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
              />
            </div>

            {/* Price & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Prix affiché (€) *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="Ex: 98000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 pr-8 text-sm font-bold text-[#1C3F30] focus:border-[#1C3F30] focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm font-semibold text-[#5C6960]">
                    €
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Plateforme source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as "leboncoin" | "agriaffaires" | "autre")}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
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
                <label className="block text-xs font-semibold text-[#18201B]">
                  Vendeur (Concessionnaire ou particulier)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Agri Centre 37, M. Dupont..."
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Localisation
                </label>
                <input
                  type="text"
                  placeholder="Ex: 37 - Indre-et-Loire (Tours)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>
            </div>

            {/* Observation Date & Publication Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Date d&apos;observation (Preuve horodatée) *
                </label>
                <input
                  type="text"
                  required
                  value={observedAt}
                  onChange={(e) => setObservedAt(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18201B]">
                  Date de publication de l&apos;annonce
                </label>
                <input
                  type="text"
                  placeholder="JJ/MM/AAAA"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2 text-sm text-[#18201B] focus:border-[#1C3F30] focus:outline-none"
                />
              </div>
            </div>

            {/* Note / Analysis */}
            <div>
              <label className="block text-xs font-semibold text-[#18201B]">
                Commentaire d&apos;analyse / Équivalence
              </label>
              <textarea
                rows={2}
                placeholder="Pourquoi cette annonce est-elle pertinente ? (Ex: Même modèle, 300h de plus, boîte équivalente...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#18201B] placeholder-[#94A3B8] focus:border-[#1C3F30] focus:outline-none"
              />
            </div>

            {/* Images preview */}
            {images.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#18201B] mb-1.5">
                  Photos capturées pour la preuve ({images.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-[#CBD5E1]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Preuve" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E5DC]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#5C6960] hover:bg-[#F0F2ED] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#1C3F30] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#25523F] disabled:opacity-50 transition-all active:scale-95"
              >
                {submitting ? "Enregistrement..." : "Enregistrer la preuve"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
