import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1E2721]">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#1E2721]">Bien introuvable</h2>
        <p className="mt-2 text-xs text-[#67726A]">Ce matériel n&apos;existe pas ou a été archivé.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#213B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F4F6F1] hover:bg-[#2C4E3E] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}
