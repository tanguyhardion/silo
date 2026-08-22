import Link from "next/link";
import { Plus, Wheat } from "lucide-react";

interface HeaderProps {
  onOpenNewProductModal?: () => void;
}

export function Header({ onOpenNewProductModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#DFD9CC] bg-[#F7F5F0]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#213B2F] text-[#EDE9DF] shadow-md transition-transform group-hover:scale-105 border border-[#315645]">
            <Wheat className="h-6 w-6 text-[#E0AF62]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-[#1E2721]">
                SILO
              </span>
            </div>
            <p className="text-xs text-[#67726A] hidden sm:block font-medium">
              Valorisation du patrimoine matériel
            </p>
          </div>
        </Link>

        {/* Action Button */}
        {onOpenNewProductModal && (
          <button
            onClick={onOpenNewProductModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] shadow-sm hover:bg-[#2C4E3E] active:scale-95 transition-all focus:outline-none border border-[#16271F]"

          >
            <Plus className="h-4 w-4 text-[#E0AF62]" />
            <span>Nouveau bien</span>
          </button>
        )}
      </div>
    </header>
  );
}
