import { Suspense } from "react";
import ListingsContent from "./listings-content";

function ListingsFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-24">
      <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
      <div className="text-gray-400 animate-pulse">Loading amazing properties...</div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsFallback />}>
      <ListingsContent />
    </Suspense>
  );
}
