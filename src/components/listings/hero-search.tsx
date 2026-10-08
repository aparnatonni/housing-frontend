"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = React.useState("");

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const query = city.trim();
        router.push(query ? `/listings?city=${encodeURIComponent(query)}` : "/listings");
      }}
    >
      <label htmlFor="hero-city" className="sr-only">
        Search by city
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="hero-city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Search by city — e.g. New York"
          className="h-11 bg-background pl-9 shadow-sm"
        />
      </div>
      <Button type="submit" className="h-11 px-6">
        Search homes
      </Button>
    </form>
  );
}
