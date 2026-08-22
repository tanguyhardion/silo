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
  FileText,
  History,
  Plus,
  ExternalLink,
  ShieldCheck,
  Clock,
  Printer,
  MapPin,
  User,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] text-[#18201B]">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-64 rounded-3xl bg-white/60 animate-pulse border border-[#E2E5DC]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] text-[#18201B]">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-[#18201B]">Bien introuvable</h2>
          <p className="mt-2 text-sm text-[#5C6960]">Ce matériel a été supprimé ou n&apos;existe pas.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au parc</span>
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
    <div className="min-h-screen bg-[#F9F9F6] text-[#18201B]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C6960] hover:text-[#1C3F30] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Retour à la liste du parc</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C6960] shadow-2xs hover:bg-[#F0F2ED] transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimer la fiche de valeur</span>
          </button>
        </div>

        {/* HERO SECTION : Produit & Valeur Actuelle */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E2E5DC] bg-white shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Image Cover */}
            <div className="relative aspect-16/9 lg:aspect-auto lg:col-span-5 overflow-hidden bg-[#EBECE5]">
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
                <span className="rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {product.type}
                </span>
              </div>
            </div>

            {/* Product Details & Actions */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D78A2E]">
                    Fiche d&apos;évaluation
                  </span>
                  <span className="text-xs text-[#8A968E]">•</span>
                  <span className="text-xs text-[#5C6960]">
                    Créé le {formatDate(product.createdAt)}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-extrabold text-[#18201B] sm:text-3xl">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="mt-4 text-xs leading-relaxed text-[#5C6960]">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Valuation Banner & Call to Action */}
              <div className="mt-6 rounded-2xl bg-[#F8FAF7] p-4 sm:p-5 border border-[#E2E5DC]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6960]">
                      Valeur estimée retenue
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#1C3F30]">
                        {formatCurrency(product.currentEstimatedValue, product.currency)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5C6960]">
                      <Calendar className="h-3.5 w-3.5 text-[#1C3F30]" />
                      <span>
                        Dernière valorisation au :{" "}
                        <strong className="font-semibold text-[#18201B]">
                          {product.lastValuationDate || "Aujourd'hui"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setIsValuationModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#25523F] active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nouvelle valeur</span>
                    </button>
                    <button
                      onClick={() => setIsListingModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1C3F30] bg-white px-4 py-2.5 text-sm font-bold text-[#1C3F30] shadow-2xs hover:bg-[#F0F2ED] active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter preuve</span>
                    </button>
                  </div>
                </div>

                {avgListingPrice && (
                  <div className="mt-3 border-t border-[#E2E5DC] pt-3 flex items-center justify-between text-xs">
                    <span className="text-[#5C6960]">
                      Moyenne des {validPrices.length} annonces comparables :
                    </span>
                    <span className="font-bold text-[#18201B]">
                      {formatCurrency(avgListingPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="border-b border-[#E2E5DC]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-colors ${
                activeTab === "listings"
                  ? "border-[#1C3F30] text-[#1C3F30]"
                  : "border-transparent text-[#5C6960] hover:text-[#18201B]"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Annonces & Preuves de Marché ({listings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-colors ${
                activeTab === "history"
                  ? "border-[#1C3F30] text-[#1C3F30]"
                  : "border-transparent text-[#5C6960] hover:text-[#18201B]"
              }`}
            >
              <History className="h-4 w-4" />
              <span>Historique des Valeurs ({valuations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-colors ${
                activeTab === "audit"
                  ? "border-[#1C3F30] text-[#1C3F30]"
                  : "border-transparent text-[#5C6960] hover:text-[#18201B]"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F0F2ED]/60 p-4 rounded-2xl border border-[#E2E5DC]">
              <div>
                <h3 className="text-sm font-bold text-[#18201B]">
                  Preuves de marché Leboncoin & Agriaffaires
                </h3>
                <p className="text-xs text-[#5C6960]">
                  Chaque annonce enregistrée est horodatée avec sa date d&apos;observation pour justifier la valeur du bien.
                </p>
              </div>
              <button
                onClick={() => setIsListingModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#25523F]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Coller une URL</span>
              </button>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col rounded-2xl border border-[#E2E5DC] bg-white p-5 shadow-xs transition-all hover:shadow-md"
                  >
                    {/* Top tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                            listing.source === "leboncoin"
                              ? "bg-[#FF6E14]/10 text-[#FF6E14]"
                              : "bg-[#25523F]/10 text-[#25523F]"
                          }`}
                        >
                          {listing.source}
                        </span>
                        {listing.sellerType && (
                          <span className="rounded-md bg-[#F0F2ED] px-2 py-0.5 text-[11px] font-medium text-[#5C6960]">
                            {listing.sellerType === "pro" ? "Vendeur Pro" : "Particulier"}
                          </span>
                        )}
                      </div>

                      {/* Observed Date (Proof Timestamp) */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                        <Clock className="h-3 w-3" />
                        <span>Observé le {listing.observedAt}</span>
                      </span>
                    </div>

                    {/* Listing Title & Price */}
                    <div className="mt-3 flex-1">
                      <h4 className="text-base font-bold text-[#18201B] line-clamp-2">
                        {listing.title}
                      </h4>
                      <div className="mt-2 text-xl font-extrabold text-[#1C3F30]">
                        {formatCurrency(listing.price, listing.currency)}
                      </div>

                      {/* Location & Seller */}
                      <div className="mt-2 space-y-1 text-xs text-[#5C6960]">
                        {listing.sellerName && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span>{listing.sellerName}</span>
                          </div>
                        )}
                        {listing.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{listing.location}</span>
                          </div>
                        )}
                      </div>

                      {/* User Notes */}
                      {listing.notes && (
                        <div className="mt-3 rounded-xl bg-[#F8FAF7] p-3 text-xs text-[#1C3F30] border border-[#E2E5DC]">
                          <strong>Note de comparaison :</strong> {listing.notes}
                        </div>
                      )}

                      {/* Photos */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {listing.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-[#CBD5E1]"
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
                    <div className="mt-4 border-t border-[#F0F2ED] pt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[#5C6960]">
                        Publication : {listing.publishedDate || "Non précisée"}
                      </span>
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1C3F30] hover:underline"
                      >
                        <span>Voir l&apos;annonce source</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-[#5C6960]" />
                <h4 className="mt-2 text-sm font-bold text-[#18201B]">
                  Aucune annonce comparable pour l&apos;instant
                </h4>
                <p className="mt-1 text-xs text-[#5C6960] max-w-md mx-auto">
                  Collez des URLs d&apos;annonces Leboncoin ou Agriaffaires pour conserver les preuves justifiant l&apos;évaluation de ce bien.
                </p>
                <button
                  onClick={() => setIsListingModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter une première preuve</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VALUATIONS HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#F0F2ED]/60 p-4 rounded-2xl border border-[#E2E5DC]">
              <div>
                <h3 className="text-sm font-bold text-[#18201B]">
                  Historique immuable des valorisations
                </h3>
                <p className="text-xs text-[#5C6960]">
                  Les anciennes valeurs ne sont jamais supprimées pour garantir l&apos;intégrité comptable et d&apos;assurance.
                </p>
              </div>
              <button
                onClick={() => setIsValuationModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#25523F]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Enregistrer une valeur</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E2E5DC] bg-white shadow-xs">
              <table className="min-w-full divide-y divide-[#E2E5DC] text-left text-xs">
                <thead className="bg-[#F8FAF7] font-semibold text-[#5C6960]">
                  <tr>
                    <th className="px-6 py-3.5">Date de valorisation</th>
                    <th className="px-6 py-3.5">Valeur estimée</th>
                    <th className="px-6 py-3.5">Justification / Notes</th>
                    <th className="px-6 py-3.5">Auteur</th>
                    <th className="px-6 py-3.5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2ED]">
                  {valuations.map((val, idx) => (
                    <tr key={val.id} className="hover:bg-[#F9F9F6] transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-[#18201B]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#1C3F30]" />
                          <span>{val.valuationDate}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-extrabold text-base text-[#1C3F30]">
                        {formatCurrency(val.value)}
                      </td>
                      <td className="px-6 py-4 text-[#5C6960] max-w-xs sm:max-w-md">
                        {val.notes || <span className="italic text-[#94A3B8]">Aucune note</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#18201B]">
                        {val.createdBy}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {idx === 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            Valeur Actuelle
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
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

        {/* TAB 3: AUDIT TRAIL / ACTIVITY LOG */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="bg-[#F0F2ED]/60 p-4 rounded-2xl border border-[#E2E5DC]">
              <h3 className="text-sm font-bold text-[#18201B]">
                Journal d&apos;activité & Traçabilité complète
              </h3>
              <p className="text-xs text-[#5C6960]">
                Répond directement à l&apos;exigence : « Qui a fait quoi, quand et avec quelles preuves ? »
              </p>
            </div>

            <div className="relative border-l-2 border-[#CBD5E1] ml-4 space-y-6 py-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-[#1C3F30]" />

                  <div className="rounded-2xl border border-[#E2E5DC] bg-white p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs font-bold text-[#18201B]">
                        {log.description}
                      </span>
                      <span className="text-[11px] text-[#5C6960]">
                        {new Date(log.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-[#5C6960]">
                      <User className="h-3.5 w-3.5" />
                      <span>Effectué par : <strong className="text-[#18201B]">{log.actor}</strong></span>
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
