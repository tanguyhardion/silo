import { Product, Valuation, Listing, ActivityLog } from "@/types";

let memoryProducts: Product[] = [
  {
    id: "prod-1",
    name: "John Deere 6155R AutoPower",
    type: "Tracteur",
    description: "Tracteur de tête d'exploitation, boîte AutoPower CommandArm, pont avant suspendu TLS, relevage avant avec prise de force. Entretien suivi en concession.",
    currentEstimatedValue: 98000,
    currency: "EUR",
    mainImageUrl: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-08-22T14:30:00.000Z",
    valuationsCount: 3,
    listingsCount: 3,
    lastValuationDate: "22/08/2026",
  },
  {
    id: "prod-2",
    name: "Claas Lexion 770 TT",
    type: "Moissonneuse-batteuse",
    description: "Moissonneuse équipée chenilles Terra Trac 635mm, coupe V930 avec chariot de transport 4 roues, broyeur Special Cut, éparpilleur radial, GPS Cemis.",
    currentEstimatedValue: 185000,
    currency: "EUR",
    mainImageUrl: "https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    createdAt: "2026-02-10T11:20:00.000Z",
    updatedAt: "2026-07-14T10:15:00.000Z",
    valuationsCount: 2,
    listingsCount: 2,
    lastValuationDate: "14/07/2026",
  },
  {
    id: "prod-3",
    name: "Déchaumeur Horsch Joker 6 RT",
    type: "Outil de travail du sol",
    description: "Déchaumeur à disques indépendants 6m semi-porté, rouleau RollPack avec éclairage LED et herse peigne arrière. Disques changés en début de saison dernière.",
    currentEstimatedValue: 42000,
    currency: "EUR",
    mainImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    createdAt: "2026-03-01T14:00:00.000Z",
    updatedAt: "2026-08-22T21:00:00.000Z",
    valuationsCount: 2,
    listingsCount: 2,
    lastValuationDate: "22/08/2026",
  },
  {
    id: "prod-4",
    name: "Télescopique Manitou MLT 737-130 PS+",
    type: "Manutention / Télescopique",
    description: "Flèche 7m, capacité 3,7 tonnes, moteur Deutz 130cv, climatisation auto, suspension de flèche CRC, attache rapide hydraulique, godet reprise grand volume inclus.",
    currentEstimatedValue: 56500,
    currency: "EUR",
    mainImageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    createdAt: "2026-04-18T08:45:00.000Z",
    updatedAt: "2026-06-02T16:00:00.000Z",
    valuationsCount: 1,
    listingsCount: 2,
    lastValuationDate: "02/06/2026",
  },
  {
    id: "prod-5",
    name: "Toyota Hilux Invincible 2.8 D-4D",
    type: "Véhicule utilitaire / 4x4",
    description: "Pick-up d'exploitation, finition Invincible, hard-top vitré, bac de benne, attelage lourd 3.5T, protection sous châssis, pneus mixtes neufs.",
    currentEstimatedValue: 34000,
    currency: "EUR",
    mainImageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-08-10T17:20:00.000Z",
    valuationsCount: 2,
    listingsCount: 1,
    lastValuationDate: "10/08/2026",
  }
];

let memoryValuations: Valuation[] = [
  {
    id: "val-1-1",
    productId: "prod-1",
    value: 112000,
    valuationDate: "15/01/2026",
    notes: "Bilan annuel d'inventaire - Cote marché établie sur base Agriaffaires 2025/2026.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-01-15T09:05:00.000Z",
  },
  {
    id: "val-1-2",
    productId: "prod-1",
    value: 104000,
    valuationDate: "20/04/2026",
    notes: "Révision des 3000h passée en concession avec succès.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-04-20T11:00:00.000Z",
  },
  {
    id: "val-1-3",
    productId: "prod-1",
    value: 98000,
    valuationDate: "22/08/2026",
    notes: "Ajustement suite aux 3 annonces comparables observées sur Agriaffaires et Leboncoin.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-08-22T14:30:00.000Z",
  },
  {
    id: "val-2-1",
    productId: "prod-2",
    value: 195000,
    valuationDate: "10/02/2026",
    notes: "Expertise pré-saison moisson, matériel entièrement révisé.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-02-10T11:25:00.000Z",
  },
  {
    id: "val-2-2",
    productId: "prod-2",
    value: 185000,
    valuationDate: "14/07/2026",
    notes: "Fin de campagne 2026.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-07-14T10:15:00.000Z",
  },
  {
    id: "val-3-1",
    productId: "prod-3",
    value: 45000,
    valuationDate: "01/03/2026",
    notes: "Valeur comptable d'achat amortie.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-03-01T14:10:00.000Z",
  },
  {
    id: "val-3-2",
    productId: "prod-3",
    value: 42000,
    valuationDate: "22/08/2026",
    notes: "Valorisation retenue basée sur les annonces Agriaffaires de modèles similaires en 6m semi-porté.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-08-22T21:00:00.000Z",
  },
  {
    id: "val-4-1",
    productId: "prod-4",
    value: 56500,
    valuationDate: "02/06/2026",
    notes: "Cote argus agricole pro actualisée.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-06-02T16:00:00.000Z",
  },
  {
    id: "val-5-1",
    productId: "prod-5",
    value: 36000,
    valuationDate: "12/05/2026",
    notes: "Estimation La Centrale / Leboncoin pro.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-05-12T10:05:00.000Z",
  },
  {
    id: "val-5-2",
    productId: "prod-5",
    value: 34000,
    valuationDate: "10/08/2026",
    notes: "État irréprochable avec carnet.",
    createdBy: "Tanguy (Gérant)",
    createdAt: "2026-08-10T17:20:00.000Z",
  }
];

let memoryListings: Listing[] = [
  {
    id: "list-1-1",
    productId: "prod-1",
    source: "agriaffaires",
    url: "https://www.agriaffaires.com/occasion/tracteur-agricole/42918201/john-deere-6155r.html",
    title: "John Deere 6155R - Boîte AutoPower 50 km/h",
    price: 99500,
    currency: "EUR",
    sellerName: "Concessionnaire Agri-Oise",
    sellerType: "pro",
    location: "60 - Oise (Beauvais)",
    publishedDate: "18/08/2026",
    observedAt: "22/08/2026",
    description: "Très beau tracteur 6155R, 3 600h, relevage avant, pont suspendu, 4 DE électriques, écran 4600, prêt à partir.",
    specs: {
      hours: "3 600 h",
      power: "155 ch (max 202 ch avec IPM)",
      year: "2019",
      condition: "Très bon état"
    },
    images: [
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    notes: "Configuration quasiment identique à la nôtre (AutoPower, TLS, relevage avant). Très bon point de comparaison.",
    createdAt: "2026-08-22T14:10:00.000Z",
  },
  {
    id: "list-1-2",
    productId: "prod-1",
    source: "leboncoin",
    url: "https://www.leboncoin.fr/ad/materiel_agricole/2891823901.htm",
    title: "Tracteur John Deere 6155 R Ultimate",
    price: 96000,
    currency: "EUR",
    sellerName: "EARL du Grand Champ",
    sellerType: "particulier",
    location: "28 - Eure-et-Loir (Chartres)",
    publishedDate: "12/08/2026",
    observedAt: "22/08/2026",
    description: "Vends cause renouvellement John Deere 6155R Ultimate, 3 800h, révisé pour la saison, pneus 650/65R42 à 50% Michelin.",
    specs: {
      hours: "3 800 h",
      power: "155 ch",
      year: "2018",
      condition: "Bon état"
    },
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    notes: "Vente directe agriculteur.",
    createdAt: "2026-08-22T14:20:00.000Z",
  },
  {
    id: "list-1-3",
    productId: "prod-1",
    source: "agriaffaires",
    url: "https://www.agriaffaires.com/occasion/tracteur-agricole/42880194/john-deere-6155r-autopowr.html",
    title: "John Deere 6155R CommandPro TLS",
    price: 102000,
    currency: "EUR",
    sellerName: "Groupe Dubreuil Agri",
    sellerType: "pro",
    location: "85 - Vendée (La Roche-sur-Yon)",
    publishedDate: "05/08/2026",
    observedAt: "22/08/2026",
    description: "John Deere 6155R avec joystick CommandPro, 3 100 h réelles, garantie 6 mois, autoguidage SF6000 actif.",
    specs: {
      hours: "3 100 h",
      power: "155 ch",
      year: "2020",
      condition: "Excellent état"
    },
    images: [
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    notes: "Modèle un peu plus récent avec joystick CommandPro, justifie le prix légèrement supérieur.",
    createdAt: "2026-08-22T14:25:00.000Z",
  },
  {
    id: "list-3-1",
    productId: "prod-3",
    source: "agriaffaires",
    url: "https://www.agriaffaires.com/occasion/dechaumeur/41920841/horsch-joker-6-rt.html",
    title: "Déchaumeur Horsch Joker 6 RT semi-porté",
    price: 43500,
    currency: "EUR",
    sellerName: "Agri Centre 37",
    sellerType: "pro",
    location: "37 - Indre-et-Loire (Tours)",
    publishedDate: "15/08/2026",
    observedAt: "22/08/2026",
    description: "Horsch Joker 6 RT, disques 520mm neufs, double rouleau RollPack, freins pneumatiques.",
    specs: {
      year: "2021",
      condition: "Très bon état",
      options: ["Double rouleau RollPack", "Freinage pneumatique", "Disques neufs"]
    },
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    notes: "Même configuration d'attelage. Confirme la valeur de 42k€.",
    createdAt: "2026-08-22T20:50:00.000Z",
  },
  {
    id: "list-3-2",
    productId: "prod-3",
    source: "leboncoin",
    url: "https://www.leboncoin.fr/ad/materiel_agricole/287410291.htm",
    title: "Horsch Joker 6 RT 2020",
    price: 39900,
    currency: "EUR",
    sellerName: "Benoit G.",
    sellerType: "particulier",
    location: "51 - Marne (Reims)",
    publishedDate: "02/08/2026",
    observedAt: "22/08/2026",
    description: "Déchaumeur Horsch Joker 6RT, bon état général, disques à 40% d'usure, rouleau simple.",
    specs: {
      year: "2020",
      condition: "Bon état"
    },
    images: [],
    status: "active",
    notes: "Prix plus bas justifié par disques usés et rouleau simple.",
    createdAt: "2026-08-22T20:55:00.000Z",
  }
];

let memoryActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    productId: "prod-1",
    actionType: "PRODUCT_CREATED",
    description: "Création du matériel John Deere 6155R dans le parc Silo",
    actor: "Tanguy (Gérant)",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "log-2",
    productId: "prod-1",
    actionType: "VALUATION_RECORDED",
    description: "Enregistrement d'une valorisation à 112 000 €",
    metadata: { value: 112000, date: "15/01/2026" },
    actor: "Tanguy (Gérant)",
    createdAt: "2026-01-15T09:05:00.000Z",
  },
  {
    id: "log-3",
    productId: "prod-1",
    actionType: "LISTING_ADDED",
    description: "Ajout de la preuve Agriaffaires (n°42918201) à 99 500 €",
    metadata: { source: "agriaffaires", price: 99500 },
    actor: "Tanguy (Gérant)",
    createdAt: "2026-08-22T14:10:00.000Z",
  },
  {
    id: "log-4",
    productId: "prod-1",
    actionType: "LISTING_ADDED",
    description: "Ajout de la preuve Leboncoin (n°2891823901) à 96 000 €",
    metadata: { source: "leboncoin", price: 96000 },
    actor: "Tanguy (Gérant)",
    createdAt: "2026-08-22T14:20:00.000Z",
  },
  {
    id: "log-5",
    productId: "prod-1",
    actionType: "VALUATION_RECORDED",
    description: "Enregistrement d'une valorisation à 98 000 €",
    metadata: { value: 98000, date: "22/08/2026" },
    actor: "Tanguy (Gérant)",
    createdAt: "2026-08-22T14:30:00.000Z",
  },
  {
    id: "log-6",
    productId: "prod-3",
    actionType: "PRODUCT_CREATED",
    description: "Création du matériel Horsch Joker 6 RT",
    actor: "Tanguy (Gérant)",
    createdAt: "2026-03-01T14:00:00.000Z",
  },
  {
    id: "log-7",
    productId: "prod-3",
    actionType: "LISTING_ADDED",
    description: "Ajout de la preuve Agriaffaires (n°41920841) à 43 500 €",
    actor: "Tanguy (Gérant)",
    createdAt: "2026-08-22T20:50:00.000Z",
  },
  {
    id: "log-8",
    productId: "prod-3",
    actionType: "VALUATION_RECORDED",
    description: "Enregistrement d'une valorisation à 42 000 €",
    metadata: { value: 42000, date: "22/08/2026" },
    actor: "Tanguy (Gérant)",
    createdAt: "2026-08-22T21:00:00.000Z",
  }
];

export const dbService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    return memoryProducts.map(p => {
      const pVals = memoryValuations.filter(v => v.productId === p.id);
      const pListings = memoryListings.filter(l => l.productId === p.id);
      const lastVal = pVals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      return {
        ...p,
        valuationsCount: pVals.length,
        listingsCount: pListings.length,
        lastValuationDate: lastVal ? lastVal.valuationDate : null,
      };
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    const p = memoryProducts.find(item => item.id === id);
    if (!p) return null;
    const pVals = memoryValuations.filter(v => v.productId === p.id);
    const pListings = memoryListings.filter(l => l.productId === p.id);
    const lastVal = pVals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return {
      ...p,
      valuationsCount: pVals.length,
      listingsCount: pListings.length,
      lastValuationDate: lastVal ? lastVal.valuationDate : null,
    };
  },

  async createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt"> & { initialValuationNotes?: string }): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id,
      status: data.status || "active",
      currency: data.currency || "EUR",
      createdAt: now,
      updatedAt: now,
      valuationsCount: 1,
      listingsCount: 0,
      lastValuationDate: new Date().toLocaleDateString("fr-FR"),
    };
    memoryProducts.unshift(newProduct);

    // Initial valuation
    const valId = `val-${Date.now()}`;
    const initialVal: Valuation = {
      id: valId,
      productId: id,
      value: data.currentEstimatedValue,
      valuationDate: new Date().toLocaleDateString("fr-FR"),
      notes: data.initialValuationNotes || "Valorisation initiale lors de la création du bien.",
      createdBy: "Utilisateur Silo",
      createdAt: now,
    };
    memoryValuations.unshift(initialVal);

    // Activity Log
    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId: id,
      actionType: "PRODUCT_CREATED",
      description: `Création du matériel ${data.name} (Valeur initiale : ${data.currentEstimatedValue.toLocaleString("fr-FR")} €)`,
      actor: "Utilisateur Silo",
      createdAt: now,
    });

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = memoryProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    memoryProducts[index] = {
      ...memoryProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId: id,
      actionType: "PRODUCT_UPDATED",
      description: `Mise à jour des informations du matériel`,
      actor: "Utilisateur Silo",
      createdAt: new Date().toISOString(),
    });

    return memoryProducts[index];
  },

  // VALUATIONS
  async getValuationsByProduct(productId: string): Promise<Valuation[]> {
    return memoryValuations
      .filter(v => v.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addValuation(productId: string, data: { value: number; valuationDate?: string; notes?: string; createdBy?: string }): Promise<Valuation> {
    const valDate = data.valuationDate || new Date().toLocaleDateString("fr-FR");
    const newVal: Valuation = {
      id: `val-${Date.now()}`,
      productId,
      value: data.value,
      valuationDate: valDate,
      notes: data.notes || null,
      createdBy: data.createdBy || "Utilisateur Silo",
      createdAt: new Date().toISOString(),
    };
    memoryValuations.unshift(newVal);

    // Update product current value
    const pIndex = memoryProducts.findIndex(p => p.id === productId);
    if (pIndex !== -1) {
      memoryProducts[pIndex].currentEstimatedValue = data.value;
      memoryProducts[pIndex].updatedAt = new Date().toISOString();
    }

    // Activity log
    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId,
      actionType: "VALUATION_RECORDED",
      description: `Enregistrement d'une valorisation à ${data.value.toLocaleString("fr-FR")} € (${valDate})`,
      metadata: { value: data.value, valuationDate: valDate, notes: data.notes },
      actor: data.createdBy || "Utilisateur Silo",
      createdAt: new Date().toISOString(),
    });

    return newVal;
  },

  // LISTINGS
  async getListingsByProduct(productId: string): Promise<Listing[]> {
    return memoryListings
      .filter(l => l.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addListing(productId: string, data: Omit<Listing, "id" | "productId" | "createdAt" | "status">): Promise<Listing> {
    const now = new Date().toISOString();
    const newListing: Listing = {
      ...data,
      id: `list-${Date.now()}`,
      productId,
      status: "active",
      createdAt: now,
    };
    memoryListings.unshift(newListing);

    // Activity log
    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId,
      actionType: "LISTING_ADDED",
      description: `Ajout de la preuve ${data.source.toUpperCase()} : "${data.title}" (${data.price.toLocaleString("fr-FR")} €)`,
      metadata: { source: data.source, price: data.price, url: data.url },
      actor: "Utilisateur Silo",
      createdAt: now,
    });

    return newListing;
  },

  // ACTIVITY LOGS
  async getActivityLogsByProduct(productId: string): Promise<ActivityLog[]> {
    return memoryActivityLogs
      .filter(l => l.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
