import { CardGridSkeleton } from "@/components/skeletons";

export default function ListingsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <CardGridSkeleton count={9} />
    </div>
  );
}
