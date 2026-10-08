"use client";

import { Toaster as SonnerToaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";

function AppToaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme={theme}
      toastOptions={{
        classNames: { toast: "font-sans text-sm" },
      }}
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <AppToaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
