"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { ProductCard } from "@/components/ProductCard";
import { NewProductModal } from "@/components/NewProductModal";
import { Search, Filter, Plus, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("value-desc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalEstimatedValue = products.reduce(
    (acc, p) => acc + (p.currentEstimatedValue || 0),
    0
  );
  const totalListings = products.reduce((acc, p) => acc + (p.listingsCount || 0), 0);
  const totalValuations = products.reduce((acc, p) => acc + (p.valuationsCount || 0), 0);

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === "all" || p.type === selectedType;

      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "value-desc") return (b.currentEstimatedValue || 0) - (a.currentEstimatedValue || 0);
      if (sortBy === "value-asc") return (a.currentEstimatedValue || 0) - (b.currentEstimatedValue || 0);
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const uniqueTypes = Array.from(new Set(products.map((p) => p.type)));

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#18201B]">
      <Header onOpenNewProductModal={() => setIsModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1C3F30] p-6 text-white shadow-xl sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#D78A2E] animate-pulse" />
              <span>Système de valorisation & preuves certifiées</span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Justifiez la valeur de vos matériels en toute confiance
            </h1>
            <p className="mt-3 text-sm text-[#D1D9D4] leading-relaxed">
              Conservez un historique immuable de vos cotations agricoles, étayé par des annonces réelles Leboncoin et Agriaffaires archivées avec leur date d&apos;observation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1C3F30] shadow-sm hover:bg-[#F0F2ED] transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 text-[#1C3F30]" />
                <span>Ajouter un matériel</span>
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none hidden md:block">
            <svg className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none" fill="currentColor">
              <path d="M0,150 Q120,80 250,130 T500,90 L500,300 L0,300 Z" />
              <path d="M0,200 Q150,140 300,180 T500,160 L500,300 L0,300 Z" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Global Statistics */}
        <StatsCards
          totalProducts={products.length}
          totalEstimatedValue={totalEstimatedValue}
          totalListings={totalListings}
          totalValuations={totalValuations}
        />

        {/* Search, Filter & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-[#E2E5DC] py-4">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6960]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un bien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#CBD5E1] bg-white pl-10 pr-4 py-2.5 text-sm text-[#18201B] placeholder-[#94A3B8] shadow-2xs focus:border-[#1C3F30] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#5C6960] hidden sm:block" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#18201B] shadow-2xs focus:border-[#1C3F30] focus:outline-none"
              >
                <option value="all">Tous les types ({products.length})</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#18201B] shadow-2xs focus:border-[#1C3F30] focus:outline-none"
            >
              <option value="value-desc">Valeur : Plus élevée</option>
              <option value="value-asc">Valeur : Plus faible</option>
              <option value="name-asc">Nom (A-Z)</option>
              <option value="date-desc">Récemment ajoutés</option>
            </select>

            <button
              onClick={fetchProducts}
              title="Rafraîchir les données"
              className="rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#5C6960] hover:bg-[#F0F2ED] hover:text-[#18201B] transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl border border-[#E2E5DC] bg-white/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white/60 p-12 text-center">
            <h3 className="text-base font-semibold text-[#18201B]">
              Aucun bien ne correspond à votre recherche
            </h3>
            <p className="mt-1 text-xs text-[#5C6960]">
              Essayez de modifier vos filtres ou ajoutez votre premier matériel.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#25523F]"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau bien</span>
            </button>
          </div>
        )}
      </main>

      <NewProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
