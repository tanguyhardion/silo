import { db } from "@/db";
import { products, valuations, listings, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Product, Valuation, Listing, ActivityLog } from "@/types";

// Fallback mémoire local si DATABASE_URL n'est pas configuré
let memoryProducts: Product[] = [];
let memoryValuations: Valuation[] = [];
let memoryListings: Listing[] = [];
let memoryActivityLogs: ActivityLog[] = [];

export const dbService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (db) {
      const dbProds = await db.select().from(products).orderBy(desc(products.createdAt));
      const allVals = await db.select().from(valuations);
      const allLists = await db.select().from(listings);

      return dbProds.map((p) => {
        const pVals = allVals.filter((v) => v.productId === p.id);
        const pLists = allLists.filter((l) => l.productId === p.id);
        const lastVal = pVals.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        return {
          id: p.id,
          name: p.name,
          type: p.type,
          customType: p.customType,
          description: p.description,
          currentEstimatedValue: parseFloat(p.currentEstimatedValue || "0"),
          currency: p.currency,
          mainImageUrl: p.mainImageUrl,
          status: (p.status as "active" | "archived") || "active",
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          valuationsCount: pVals.length,
          listingsCount: pLists.length,
          lastValuationDate: lastVal ? lastVal.valuationDate : null,
        };
      });
    }

    return memoryProducts.map((p) => {
      const pVals = memoryValuations.filter((v) => v.productId === p.id);
      const pListings = memoryListings.filter((l) => l.productId === p.id);
      const lastVal = pVals.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      return {
        ...p,
        valuationsCount: pVals.length,
        listingsCount: pListings.length,
        lastValuationDate: lastVal ? lastVal.valuationDate : null,
      };
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    if (db) {
      const res = await db.select().from(products).where(eq(products.id, id)).limit(1);
      const p = res[0];
      if (!p) return null;

      const pVals = await db.select().from(valuations).where(eq(valuations.productId, id));
      const pLists = await db.select().from(listings).where(eq(listings.productId, id));
      const lastVal = pVals.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        customType: p.customType,
        description: p.description,
        currentEstimatedValue: parseFloat(p.currentEstimatedValue || "0"),
        currency: p.currency,
        mainImageUrl: p.mainImageUrl,
        status: (p.status as "active" | "archived") || "active",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        valuationsCount: pVals.length,
        listingsCount: pLists.length,
        lastValuationDate: lastVal ? lastVal.valuationDate : null,
      };
    }

    const p = memoryProducts.find((item) => item.id === id);
    if (!p) return null;
    const pVals = memoryValuations.filter((v) => v.productId === p.id);
    const pListings = memoryListings.filter((l) => l.productId === p.id);
    const lastVal = pVals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return {
      ...p,
      valuationsCount: pVals.length,
      listingsCount: pListings.length,
      lastValuationDate: lastVal ? lastVal.valuationDate : null,
    };
  },

  async createProduct(
    data: Omit<Product, "id" | "createdAt" | "updatedAt"> & { initialValuationNotes?: string }
  ): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const now = new Date();

    if (db) {
      await db.insert(products).values({
        id,
        name: data.name,
        type: data.type,
        customType: data.customType || null,
        description: data.description || null,
        currentEstimatedValue: data.currentEstimatedValue.toString(),
        currency: data.currency || "EUR",
        mainImageUrl: data.mainImageUrl || null,
        status: data.status || "active",
        createdAt: now,
        updatedAt: now,
      });

      const valId = `val-${Date.now()}`;
      await db.insert(valuations).values({
        id: valId,
        productId: id,
        value: data.currentEstimatedValue.toString(),
        valuationDate: new Date().toLocaleDateString("fr-FR"),
        notes: data.initialValuationNotes || "Valorisation initiale.",
        createdBy: "Utilisateur Silo",
        createdAt: now,
      });

      await db.insert(activityLogs).values({
        id: `log-${Date.now()}`,
        productId: id,
        actionType: "PRODUCT_CREATED",
        description: `Création du bien ${data.name} (Valeur : ${data.currentEstimatedValue.toLocaleString("fr-FR")} €)`,
        metadata: JSON.stringify({ value: data.currentEstimatedValue }),
        actor: "Utilisateur Silo",
        createdAt: now,
      });

      return {
        ...data,
        id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        valuationsCount: 1,
        listingsCount: 0,
        lastValuationDate: new Date().toLocaleDateString("fr-FR"),
      };
    }

    const newProduct: Product = {
      ...data,
      id,
      status: data.status || "active",
      currency: data.currency || "EUR",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      valuationsCount: 1,
      listingsCount: 0,
      lastValuationDate: new Date().toLocaleDateString("fr-FR"),
    };
    memoryProducts.unshift(newProduct);

    const initialVal: Valuation = {
      id: `val-${Date.now()}`,
      productId: id,
      value: data.currentEstimatedValue,
      valuationDate: new Date().toLocaleDateString("fr-FR"),
      notes: data.initialValuationNotes || "Valorisation initiale.",
      createdBy: "Utilisateur Silo",
      createdAt: now.toISOString(),
    };
    memoryValuations.unshift(initialVal);

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId: id,
      actionType: "PRODUCT_CREATED",
      description: `Création du bien ${data.name} (Valeur : ${data.currentEstimatedValue.toLocaleString("fr-FR")} €)`,
      actor: "Utilisateur Silo",
      createdAt: now.toISOString(),
    });

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const now = new Date();
    if (db) {
      const setObj: Record<string, unknown> = {
        updatedAt: now,
      };
      if (updates.name !== undefined) setObj.name = updates.name;
      if (updates.type !== undefined) setObj.type = updates.type;
      if (updates.customType !== undefined) setObj.customType = updates.customType;
      if (updates.description !== undefined) setObj.description = updates.description;
      if (updates.mainImageUrl !== undefined) setObj.mainImageUrl = updates.mainImageUrl;
      if (updates.status !== undefined) setObj.status = updates.status;
      if (updates.currentEstimatedValue !== undefined) {
        setObj.currentEstimatedValue = updates.currentEstimatedValue.toString();
      }

      await db
        .update(products)
        .set(setObj)
        .where(eq(products.id, id));

      await db.insert(activityLogs).values({
        id: `log-${Date.now()}`,
        productId: id,
        actionType: "PRODUCT_UPDATED",
        description: `Mise à jour des informations du bien${updates.name ? ` (${updates.name})` : ""}.`,
        actor: "Utilisateur Silo",
        createdAt: now,
      });

      return this.getProductById(id);
    }

    const index = memoryProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    memoryProducts[index] = {
      ...memoryProducts[index],
      ...updates,
      updatedAt: now.toISOString(),
    };

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId: id,
      actionType: "PRODUCT_UPDATED",
      description: `Mise à jour des informations du bien${updates.name ? ` (${updates.name})` : ""}.`,
      actor: "Utilisateur Silo",
      createdAt: now.toISOString(),
    });

    return memoryProducts[index];
  },

  // VALUATIONS
  async getValuationsByProduct(productId: string): Promise<Valuation[]> {
    if (db) {
      const res = await db
        .select()
        .from(valuations)
        .where(eq(valuations.productId, productId))
        .orderBy(desc(valuations.createdAt));

      return res.map((v) => ({
        id: v.id,
        productId: v.productId,
        value: parseFloat(v.value),
        valuationDate: v.valuationDate,
        notes: v.notes,
        createdBy: v.createdBy,
        createdAt: v.createdAt.toISOString(),
      }));
    }

    return memoryValuations
      .filter((v) => v.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addValuation(
    productId: string,
    data: { value: number; valuationDate?: string; notes?: string; createdBy?: string }
  ): Promise<Valuation> {
    const valDate = data.valuationDate || new Date().toLocaleDateString("fr-FR");
    const valId = `val-${Date.now()}`;
    const now = new Date();

    if (db) {
      await db.insert(valuations).values({
        id: valId,
        productId,
        value: data.value.toString(),
        valuationDate: valDate,
        notes: data.notes || null,
        createdBy: data.createdBy || "Utilisateur Silo",
        createdAt: now,
      });

      await db
        .update(products)
        .set({
          currentEstimatedValue: data.value.toString(),
          updatedAt: now,
        })
        .where(eq(products.id, productId));

      await db.insert(activityLogs).values({
        id: `log-${Date.now()}`,
        productId,
        actionType: "VALUATION_RECORDED",
        description: `Enregistrement d'une valorisation à ${data.value.toLocaleString("fr-FR")} € (${valDate})`,
        metadata: JSON.stringify({ value: data.value, valuationDate: valDate }),
        actor: data.createdBy || "Utilisateur Silo",
        createdAt: now,
      });

      return {
        id: valId,
        productId,
        value: data.value,
        valuationDate: valDate,
        notes: data.notes || null,
        createdBy: data.createdBy || "Utilisateur Silo",
        createdAt: now.toISOString(),
      };
    }

    const newVal: Valuation = {
      id: valId,
      productId,
      value: data.value,
      valuationDate: valDate,
      notes: data.notes || null,
      createdBy: data.createdBy || "Utilisateur Silo",
      createdAt: now.toISOString(),
    };
    memoryValuations.unshift(newVal);

    const pIndex = memoryProducts.findIndex((p) => p.id === productId);
    if (pIndex !== -1) {
      memoryProducts[pIndex].currentEstimatedValue = data.value;
      memoryProducts[pIndex].updatedAt = now.toISOString();
    }

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId,
      actionType: "VALUATION_RECORDED",
      description: `Enregistrement d'une valorisation à ${data.value.toLocaleString("fr-FR")} € (${valDate})`,
      actor: data.createdBy || "Utilisateur Silo",
      createdAt: now.toISOString(),
    });

    return newVal;
  },

  // LISTINGS
  async getListingsByProduct(productId: string): Promise<Listing[]> {
    if (db) {
      const res = await db
        .select()
        .from(listings)
        .where(eq(listings.productId, productId))
        .orderBy(desc(listings.createdAt));

      return res.map((l) => ({
        id: l.id,
        productId: l.productId,
        source: l.source as "leboncoin" | "agriaffaires" | "autre",
        url: l.url,
        title: l.title,
        price: parseFloat(l.price),
        currency: l.currency,
        sellerName: l.sellerName,
        sellerType: (l.sellerType as "particulier" | "pro") || null,
        location: l.location,
        publishedDate: l.publishedDate,
        observedAt: l.observedAt,
        description: l.description,
        specs: l.specs ? JSON.parse(l.specs) : {},
        images: l.images ? JSON.parse(l.images) : [],
        status: (l.status as "active" | "archived") || "active",
        notes: l.notes,
        createdAt: l.createdAt.toISOString(),
      }));
    }

    return memoryListings
      .filter((l) => l.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addListing(
    productId: string,
    data: Omit<Listing, "id" | "productId" | "createdAt" | "status">
  ): Promise<Listing> {
    const listId = `list-${Date.now()}`;
    const now = new Date();

    if (db) {
      await db.insert(listings).values({
        id: listId,
        productId,
        source: data.source,
        url: data.url,
        title: data.title,
        price: data.price.toString(),
        currency: data.currency || "EUR",
        sellerName: data.sellerName || null,
        sellerType: data.sellerType || null,
        location: data.location || null,
        publishedDate: data.publishedDate || null,
        observedAt: data.observedAt,
        description: data.description || null,
        specs: JSON.stringify(data.specs || {}),
        images: JSON.stringify(data.images || []),
        status: "active",
        notes: data.notes || null,
        createdAt: now,
      });

      await db.insert(activityLogs).values({
        id: `log-${Date.now()}`,
        productId,
        actionType: "LISTING_ADDED",
        description: `Ajout de la preuve ${data.source.toUpperCase()} : "${data.title}" (${data.price.toLocaleString("fr-FR")} €)`,
        metadata: JSON.stringify({ source: data.source, price: data.price }),
        actor: "Utilisateur Silo",
        createdAt: now,
      });

      return {
        ...data,
        id: listId,
        productId,
        status: "active",
        createdAt: now.toISOString(),
      };
    }

    const newListing: Listing = {
      ...data,
      id: listId,
      productId,
      status: "active",
      createdAt: now.toISOString(),
    };
    memoryListings.unshift(newListing);

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId,
      actionType: "LISTING_ADDED",
      description: `Ajout de la preuve ${data.source.toUpperCase()} : "${data.title}" (${data.price.toLocaleString("fr-FR")} €)`,
      actor: "Utilisateur Silo",
      createdAt: now.toISOString(),
    });

    return newListing;
  },

  async updateListing(
    productId: string,
    listingId: string,
    updates: Partial<Listing>
  ): Promise<Listing | null> {
    const now = new Date();
    if (db) {
      const setObj: Record<string, unknown> = {};
      if (updates.notes !== undefined) setObj.notes = updates.notes;
      if (updates.title !== undefined) setObj.title = updates.title;
      if (updates.price !== undefined) setObj.price = updates.price.toString();
      if (updates.sellerName !== undefined) setObj.sellerName = updates.sellerName;
      if (updates.location !== undefined) setObj.location = updates.location;
      if (updates.publishedDate !== undefined) setObj.publishedDate = updates.publishedDate;
      if (updates.observedAt !== undefined) setObj.observedAt = updates.observedAt;
      if (updates.description !== undefined) setObj.description = updates.description;
      if (updates.status !== undefined) setObj.status = updates.status;
      if (updates.specs !== undefined) setObj.specs = JSON.stringify(updates.specs);
      if (updates.images !== undefined) setObj.images = JSON.stringify(updates.images);

      if (Object.keys(setObj).length > 0) {
        await db
          .update(listings)
          .set(setObj)
          .where(eq(listings.id, listingId));
      }

      const existingListing = await db
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .limit(1);

      const title = existingListing[0]?.title || "Preuve";

      await db.insert(activityLogs).values({
        id: `log-${Date.now()}`,
        productId,
        actionType: "LISTING_UPDATED",
        description: `Mise à jour de la note d'analyse pour la preuve "${title}".`,
        metadata: JSON.stringify({ listingId, notes: updates.notes }),
        actor: "Utilisateur Silo",
        createdAt: now,
      });

      const updatedList = await this.getListingsByProduct(productId);
      return updatedList.find((l) => l.id === listingId) || null;
    }

    const index = memoryListings.findIndex((l) => l.id === listingId);
    if (index === -1) return null;

    memoryListings[index] = {
      ...memoryListings[index],
      ...updates,
    };

    memoryActivityLogs.unshift({
      id: `log-${Date.now()}`,
      productId,
      actionType: "LISTING_UPDATED",
      description: `Mise à jour de la note d'analyse pour la preuve "${memoryListings[index].title}".`,
      metadata: { listingId, notes: updates.notes },
      actor: "Utilisateur Silo",
      createdAt: now.toISOString(),
    });

    return memoryListings[index];
  },

  // ACTIVITY LOGS
  async getActivityLogsByProduct(productId: string): Promise<ActivityLog[]> {
    if (db) {
      const res = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.productId, productId))
        .orderBy(desc(activityLogs.createdAt));

      return res.map((log) => ({
        id: log.id,
        productId: log.productId,
        actionType: log.actionType as ActivityLog["actionType"],
        description: log.description,
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
        actor: log.actor,
        createdAt: log.createdAt.toISOString(),
      }));
    }

    return memoryActivityLogs
      .filter((l) => l.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
