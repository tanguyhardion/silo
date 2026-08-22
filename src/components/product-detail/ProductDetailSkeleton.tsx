import { Header } from "@/components/Header";

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1E2721]">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 rounded-3xl bg-[#FCFBF8] animate-pulse border border-[#DFD9CC]" />
      </div>
    </div>
  );
}
