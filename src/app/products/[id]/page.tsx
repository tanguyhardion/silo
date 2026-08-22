"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Product, Valuation, Listing, ActivityLog } from "@/types";
import { Header } from "@/components/Header";
import { AddValuationModal } from "@/components/AddValuationModal";
import { AddListingModal } from "@/components/AddListingModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  FileCheck,
  History,
  Plus,
  ExternalLink,
  ShieldCheck,
  Clock,
  Printer,
  MapPin,
  User,
  Scale,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "history" | "audit">("listings");

  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setValuations(data.valuations || []);
        setListings(data.listings || []);
        setActivityLogs(data.activityLogs || []);
      }
    } catch (err) {
      console.error("Erreur chargement détails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | Silo`;
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#1E2721]">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-64 rounded-3xl bg-[#FCFBF8] animate-pulse border border-[#DFD9CC]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#1E2721]">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#1E2721]">Bien introuvable</h2>
          <p className="mt-2 text-xs text-[#67726A]">Ce matériel n&apos;existe pas ou a été archivé.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    );
  }

  const validPrices = listings.map((l) => l.price).filter((p) => p > 0);
  const avgListingPrice =
    validPrices.length > 0
      ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
      : null;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1E2721]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Print Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#67726A] hover:text-[#213B2F] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Retour</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] px-3.5 py-2 text-xs font-semibold text-[#1E2721] shadow-2xs hover:bg-[#EBE7DD] transition-colors"
          >
            <Printer className="h-4 w-4 text-[#C87D20]" />
            <span>Imprimer la Fiche de Valorisation</span>
          </button>
        </div>

        {/* HERO SECTION : Produit & Valeur Actuelle */}
        <div className="relative overflow-hidden rounded-3xl border border-[#DFD9CC] bg-[#FCFBF8] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Image Cover */}
            <div className="relative aspect-16/9 lg:aspect-auto lg:col-span-5 overflow-hidden bg-[#EAE6DC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  product.mainImageUrl ||
                  "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1200&q=80"
                }
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="rounded-lg bg-[#213B2F]/90 px-3 py-1 text-xs font-semibold text-[#F4F6F1] backdrop-blur-md border border-[#3D6652]/40">
                  {product.type}
                </span>
              </div>
            </div>

            {/* Product Details & Actions */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#C87D20]">
                    Fiche d&apos;Évaluation & Preuves
                  </span>
                  <span className="text-xs text-[#A8B3AC]">•</span>
                  <span className="text-xs text-[#67726A]">
                    Enregistré le {formatDate(product.createdAt)}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E2721]">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[#505A53]">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Valuation Banner & Call to Action */}
              <div className="mt-6 rounded-2xl bg-[#F7F5F0] p-5 border border-[#DFD9CC]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#7D8880]">
                      Valeur Estimée Retenue
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#213B2F]">
                        {product.currentEstimatedValue ? formatCurrency(product.currentEstimatedValue, product.currency) : "- €"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#67726A]">
                      <Calendar className="h-3.5 w-3.5 text-[#C87D20]" />
                      <span>
                        Dernière valorisation :{" "}
                        <strong className="font-bold text-[#1E2721]">
                          {product.lastValuationDate || "Aujourd'hui"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => setIsValuationModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4 text-[#E0AF62]" />
                      <span>Nouvelle valeur</span>
                    </button>
                    <button
                      onClick={() => setIsListingModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#213B2F] bg-[#FCFBF8] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#213B2F] shadow-2xs hover:bg-[#EBE7DD] active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter preuve</span>
                    </button>
                  </div>
                </div>

                {avgListingPrice && (
                  <div className="mt-3.5 border-t border-[#DFD9CC] pt-3 flex items-center justify-between text-xs">
                    <span className="text-[#67726A] flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-[#C87D20]" />
                      Moyenne observée ({validPrices.length} annonces) :
                    </span>
                    <span className="text-base font-bold text-[#1E2721]">
                      {formatCurrency(avgListingPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="border-b border-[#DFD9CC]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "listings"
                  ? "border-[#213B2F] text-[#213B2F]"
                  : "border-transparent text-[#67726A] hover:text-[#1E2721]"
              }`}
            >
              <FileCheck className="h-4 w-4 text-[#C87D20]" />
              <span>Annonces & Preuves ({listings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "history"
                  ? "border-[#213B2F] text-[#213B2F]"
                  : "border-transparent text-[#67726A] hover:text-[#1E2721]"
              }`}
            >
              <History className="h-4 w-4" />
              <span>Historique des Valeurs ({valuations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "audit"
                  ? "border-[#213B2F] text-[#213B2F]"
                  : "border-transparent text-[#67726A] hover:text-[#1E2721]"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Traçabilité & Journal ({activityLogs.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LISTINGS / PREUVES COMPARABLES */}
        {activeTab === "listings" && (
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
                onClick={() => setIsListingModalOpen(true)}
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
                  onClick={() => setIsListingModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
                  <span>Ajouter une preuve</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VALUATIONS HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#EBE7DD]/70 p-4.5 rounded-2xl border border-[#DFD9CC]">
              <div>
                <h3 className="text-base font-bold text-[#1E2721]">
                  Historique des estimations
                </h3>
                <p className="text-xs text-[#67726A]">
                  Toutes les valorisations enregistrées sont conservées dans le temps.
                </p>
              </div>
              <button
                onClick={() => setIsValuationModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-2xs hover:bg-[#2C4E3E]"
              >
                <Plus className="h-3.5 w-3.5 text-[#E0AF62]" />
                <span>Enregistrer une valeur</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8] shadow-xs">
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
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="bg-[#EBE7DD]/70 p-4.5 rounded-2xl border border-[#DFD9CC]">
              <h3 className="text-base font-bold text-[#1E2721]">
                Journal de traçabilité certifié
              </h3>
              <p className="text-xs text-[#67726A]">
                Historique complet des actes répondant à : « Pourquoi ce bien était-il valorisé à ce montant à cette date ? »
              </p>
            </div>

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
                      <span>Par : <strong className="text-[#1E2721] font-semibold">{log.actor}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddValuationModal
        productId={product.id}
        productName={product.name}
        currentValue={product.currentEstimatedValue}
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        onSuccess={loadData}
      />

      <AddListingModal
        productId={product.id}
        productName={product.name}
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
