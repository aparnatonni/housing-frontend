import { DetailSkeleton } from "@/components/skeletons";

export default function ListingDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <DetailSkeleton />
    </div>
  );
}
