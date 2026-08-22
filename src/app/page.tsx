"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { ProductCard } from "@/components/ProductCard";
import { NewProductModal } from "@/components/NewProductModal";
import { Search, Filter, Plus, RefreshCw, Wheat } from "lucide-react";

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
    <div className="min-h-screen text-[#1E2721]">
      <Header onOpenNewProductModal={() => setIsModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Global Statistics */}
        <StatsCards
          totalProducts={products.length}
          totalEstimatedValue={totalEstimatedValue}
          totalListings={totalListings}
          totalValuations={totalValuations}
        />

        {/* Search, Filter & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-[#DFD9CC] py-4">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#67726A]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] pl-10 pr-4 py-2.5 text-sm text-[#1E2721] placeholder-[#8F9992] shadow-2xs focus:border-[#213B2F] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#67726A] hidden sm:block" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] px-3.5 py-2 text-xs font-semibold text-[#1E2721] shadow-2xs focus:border-[#213B2F] focus:outline-none"
              >
                <option value="all">Toutes les catégories ({products.length})</option>
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
              className="rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] px-3.5 py-2 text-xs font-semibold text-[#1E2721] shadow-2xs focus:border-[#213B2F] focus:outline-none"
            >
              <option value="value-desc">Valeur : Décroissante</option>
              <option value="value-asc">Valeur : Croissante</option>
              <option value="name-asc">Nom (A-Z)</option>
              <option value="date-desc">Plus récents</option>
            </select>

            <button
              onClick={fetchProducts}
              title="Actualiser les données"
              className="rounded-xl border border-[#DFD9CC] bg-[#FCFBF8] p-2 text-[#67726A] hover:bg-[#EBE7DD] hover:text-[#1E2721] transition-colors"
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
                className="h-80 rounded-2xl border border-[#DFD9CC] bg-[#FCFBF8]/60 animate-pulse"
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
          <div className="rounded-3xl border border-dashed border-[#DFD9CC] bg-[#FCFBF8] p-12 text-center">
            <Wheat className="mx-auto h-8 w-8 text-[#67726A]" />
            <h3 className="mt-2 text-lg font-bold text-[#1E2721]">
              Aucun bien trouvé
            </h3>
            <p className="mt-1 text-xs text-[#67726A]">
              Modifiez vos critères de recherche ou ajoutez un nouveau matériel.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E]"
            >
              <Plus className="h-4 w-4 text-[#E0AF62]" />
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
