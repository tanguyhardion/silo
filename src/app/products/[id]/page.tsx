"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Product, Valuation, Listing, ActivityLog } from "@/types";
import { Header } from "@/components/Header";
import { AddValuationModal } from "@/components/AddValuationModal";
import { AddListingModal } from "@/components/AddListingModal";
import {
  ProductHero,
  ProductTabs,
  ProductListingsTab,
  ProductValuationsTab,
  ProductAuditTab,
  EditProductModal,
  ProductDetailSkeleton,
  ProductNotFound,
  ProductTabType,
} from "@/components/product-detail";

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
  const [activeTab, setActiveTab] = useState<ProductTabType>("listings");

  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

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
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
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
        <ProductHero
          product={product}
          avgListingPrice={avgListingPrice}
          validPricesCount={validPrices.length}
          onOpenEditProduct={() => setIsEditProductModalOpen(true)}
          onOpenValuationModal={() => setIsValuationModalOpen(true)}
          onOpenListingModal={() => setIsListingModalOpen(true)}
        />

        {/* TABS NAVIGATION */}
        <ProductTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          listingsCount={listings.length}
          valuationsCount={valuations.length}
          auditLogsCount={activityLogs.length}
        />

        {/* TAB CONTENTS */}
        {activeTab === "listings" && (
          <ProductListingsTab
            productId={product.id}
            listings={listings}
            onAddListing={() => setIsListingModalOpen(true)}
            onUpdate={loadData}
          />
        )}

        {activeTab === "history" && (
          <ProductValuationsTab
            valuations={valuations}
            onAddValuation={() => setIsValuationModalOpen(true)}
          />
        )}

        {activeTab === "audit" && (
          <ProductAuditTab activityLogs={activityLogs} />
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

      <EditProductModal
        product={product}
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
