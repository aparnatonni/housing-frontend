import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function NavbarFallback() {
  return <div className="h-16 border-b border-border bg-background/85 backdrop-blur-md" />;
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
