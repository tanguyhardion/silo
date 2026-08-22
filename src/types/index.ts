export type ProductType =
  | "Tracteur"
  | "Moissonneuse-batteuse"
  | "Outil de travail du sol"
  | "Semoir / Planteuse"
  | "Pulvérisateur"
  | "Épandeur"
  | "Remorque / Benne"
  | "Manutention / Télescopique"
  | "Véhicule utilitaire / 4x4"
  | "Autre";

export interface Product {
  id: string;
  name: string;
  type: ProductType | string;
  customType?: string | null;
  description?: string | null;
  currentEstimatedValue: number; // in Euros
  currency: string;
  mainImageUrl?: string | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  valuationsCount?: number;
  listingsCount?: number;
  lastValuationDate?: string | null;
}

export interface Valuation {
  id: string;
  productId: string;
  value: number; // in Euros
  valuationDate: string; // ISO format or YYYY-MM-DD
  notes?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface ListingSpec {
  hours?: string;
  power?: string;
  year?: string;
  condition?: string;
  options?: string[];
  [key: string]: unknown;
}

export interface Listing {
  id: string;
  productId: string;
  source: "leboncoin" | "agriaffaires" | "autre";
  url: string;
  title: string;
  price: number; // in Euros
  currency: string;
  sellerName?: string | null;
  sellerType?: "particulier" | "pro" | string | null;
  location?: string | null;
  publishedDate?: string | null;
  observedAt: string; // Date of capture as proof
  description?: string | null;
  specs?: ListingSpec;
  images: string[];
  rawData?: Record<string, unknown>;
  status: "active" | "archived";
  notes?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  productId: string;
  actionType:
    | "PRODUCT_CREATED"
    | "VALUATION_RECORDED"
    | "LISTING_ADDED"
    | "LISTING_UPDATED"
    | "PRODUCT_UPDATED"
    | "NOTE_ADDED";
  description: string;
  metadata?: Record<string, unknown>;
  actor: string;
  createdAt: string;
}

export interface ScrapedListingData {
  source: "leboncoin" | "agriaffaires" | "autre";
  url: string;
  title: string;
  price: number;
  currency: string;
  sellerName?: string;
  sellerType?: "particulier" | "pro" | string;
  location?: string;
  publishedDate?: string;
  description?: string;
  specs?: ListingSpec;
  images: string[];
}
