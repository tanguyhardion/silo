"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Link2,
  Trash2,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";

export interface ImageSuggestionItem {
  title: string;
  image: string;
  thumbnail: string;
  source?: string;
}

interface ProductImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  queryHint?: string;
  label?: string;
  onError?: (error: string | null) => void;
}

export function ProductImagePicker({
  value,
  onChange,
  queryHint = "",
  label = "Photo du matériel (optionnel)",
  onError,
}: ProductImagePickerProps) {
  const [imageInputMode, setImageInputMode] = useState<"suggest" | "upload" | "url">("suggest");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<ImageSuggestionItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState(queryHint);
  const [hasSearched, setHasSearched] = useState(false);
  const lastFetchedQueryRef = useRef<string>("");

  const searchImages = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    if (q === lastFetchedQueryRef.current) return;

    lastFetchedQueryRef.current = q;
    setLoadingSuggestions(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/suggest-images?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Sync suggestionQuery when queryHint changes
  useEffect(() => {
    if (queryHint && queryHint.trim().length >= 3) {
      setSuggestionQuery(queryHint.trim());
      const timer = setTimeout(() => {
        searchImages(queryHint.trim());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [queryHint, searchImages]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestionQuery.trim()) {
      lastFetchedQueryRef.current = "";
      searchImages(suggestionQuery.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError?.("L'image ne doit pas dépasser 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
        onError?.(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-[#67726A]">
            {label}
          </label>
        )}
        <div className="flex rounded-lg bg-[#EBE7DD] p-0.5 border border-[#DFD9CC]">
          <button
            type="button"
            onClick={() => setImageInputMode("suggest")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
              imageInputMode === "suggest"
                ? "bg-[#FCFBF8] text-[#213B2F] shadow-2xs"
                : "text-[#67726A] hover:text-[#1E2721]"
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#E0AF62]" />
            <span>Suggestions Web</span>
          </button>
          <button
            type="button"
            onClick={() => setImageInputMode("upload")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
              imageInputMode === "upload"
                ? "bg-[#FCFBF8] text-[#213B2F] shadow-2xs"
                : "text-[#67726A] hover:text-[#1E2721]"
            }`}
          >
            <Upload className="h-3 w-3" />
            <span>Fichier</span>
          </button>
          <button
            type="button"
            onClick={() => setImageInputMode("url")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
              imageInputMode === "url"
                ? "bg-[#FCFBF8] text-[#213B2F] shadow-2xs"
                : "text-[#67726A] hover:text-[#1E2721]"
            }`}
          >
            <Link2 className="h-3 w-3" />
            <span>Lien URL</span>
          </button>
        </div>
      </div>

      {/* TAB: Web Suggestions */}
      {imageInputMode === "suggest" && (
        <div className="rounded-2xl border border-[#DFD9CC] bg-[#F7F5F0] p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#67726A]" />
              <input
                type="text"
                placeholder="Rechercher des photos sur le web..."
                value={suggestionQuery}
                onChange={(e) => setSuggestionQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualSearch(e);
                  }
                }}
                className="w-full rounded-xl border border-[#DFD9CC] bg-white py-1.5 pl-8.5 pr-3 text-xs text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={loadingSuggestions || !suggestionQuery.trim()}
              className="flex items-center gap-1 rounded-xl bg-[#213B2F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2C4E3E] disabled:opacity-50 transition-colors"
            >
              {loadingSuggestions ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Chercher</span>
            </button>
          </div>

          {loadingSuggestions ? (
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-4/3 rounded-xl bg-[#EBE7DD] animate-pulse"
                />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-[#67726A]">
                Cliquez sur une image pour l&apos;associer au matériel :
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {suggestions.map((item, idx) => {
                  const isSelected = value === item.image;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange(item.image)}
                      className={`group relative aspect-4/3 overflow-hidden rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-[#213B2F] ring-2 ring-[#213B2F]/20"
                          : "border-transparent hover:border-[#C87D20]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail || item.image}
                        alt={item.title || "Suggestion"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#213B2F]/30 flex items-center justify-center backdrop-blur-2xs">
                          <div className="rounded-full bg-[#213B2F] p-1 text-white shadow-md">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-[#67726A]">
                {hasSearched
                  ? "Aucune image trouvée. Modifiez les mots-clés ci-dessus."
                  : "Saisissez un nom de bien pour obtenir automatiquement des suggestions d'images."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: Upload File */}
      {imageInputMode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DFD9CC] bg-[#F7F5F0] p-5 hover:border-[#213B2F] hover:bg-[#EBE7DD]/60 transition-all text-center"
          >
            <Upload className="h-6 w-6 text-[#C87D20]" />
            <p className="mt-2 text-xs font-bold text-[#1E2721]">
              Cliquez pour choisir une photo depuis votre appareil
            </p>
            <p className="mt-1 text-[11px] text-[#67726A]">
              PNG, JPG, WebP jusqu&apos;à 5 Mo
            </p>
          </div>
        </div>
      )}

      {/* TAB: URL Link */}
      {imageInputMode === "url" && (
        <input
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#DFD9CC] bg-white px-3.5 py-2.5 text-sm text-[#1E2721] placeholder-[#9BA59E] focus:border-[#213B2F] focus:outline-none"
        />
      )}

      {/* Selected Image Preview Bar */}
      {value && (
        <div className="relative rounded-2xl border border-[#DFD9CC] bg-[#F7F5F0] p-3 flex items-center gap-3 animate-in fade-in">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[#EAE6DC] border border-[#DFD9CC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Aperçu"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#1E2721] block truncate">
              Photo sélectionnée
            </span>
            <span className="text-[11px] text-[#67726A] block truncate">
              {value.startsWith("data:")
                ? "Fichier importé"
                : value.length > 45
                ? value.slice(0, 45) + "..."
                : value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-xl border border-[#DFD9CC] p-2 text-[#C87D20] hover:bg-[#EBE7DD] hover:text-red-600 transition-colors"
            title="Supprimer la photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
