import Link from "next/link";
import { Plus } from "lucide-react";

interface HeaderProps {
  onOpenNewProductModal?: () => void;
}

export function Header({ onOpenNewProductModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E2E5DC] bg-[#F9F9F6]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C3F30] text-white shadow-sm transition-transform group-hover:scale-105">
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stylized Silo / Farm grain structure */}
              <path d="M12 2C8.13 2 5 5.13 5 9v11a2 2 0 002 2h10a2 2 0 002-2V9c0-3.87-3.13-7-7-7zm-5 7c0-2.76 2.24-5 5-5s5 2.24 5 5v1H7V9zm10 11H7v-8h10v8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#18201B]">Silo</span>
              <span className="rounded-full bg-[#EBECE5] px-2 py-0.5 text-[11px] font-medium text-[#1C3F30]">
                Preuves & Valeur
              </span>
            </div>
            <p className="text-xs text-[#5C6960] hidden sm:block">
              Valorisation et traçabilité certifiée du matériel
            </p>
          </div>
        </Link>

        {/* Navigation & Action */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5C6960] mr-2">
            <Link href="/" className="hover:text-[#1C3F30] transition-colors">
              Mon Parc
            </Link>
            <span className="text-xs text-[#8A968E] bg-[#E8EAE2] px-2.5 py-1 rounded-md">
              100% Hors-ligne / Sécurisé
            </span>
          </div>

          {onOpenNewProductModal && (
            <button
              onClick={onOpenNewProductModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1C3F30] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#25523F] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1C3F30] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau bien</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
