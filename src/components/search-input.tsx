"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * Search box that emits debounced values. Pair with URL state via
 * useSearchParams (see listings-browser / admin manage pages).
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  label = "Search",
}: SearchInputProps) {
  const [local, setLocal] = React.useState(value);
  const [prevValue, setPrevValue] = React.useState(value);
  const debounced = useDebounce(local, 350);

  // Sync when the URL value changes externally (adjust state during render).
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  React.useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={className}>
      <label htmlFor="search-input" className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="search-input"
          type="search"
          value={local}
          placeholder={placeholder}
          onChange={(event) => setLocal(event.target.value)}
          className="pr-8 pl-8"
        />
        {local ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setLocal("");
              onChange("");
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
