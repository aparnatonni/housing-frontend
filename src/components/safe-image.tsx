"use client";

import * as React from "react";
import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "cn";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}

/**
 * next/image wrapper that degrades to a neutral housing icon when the
 * remote image is missing or fails to load.
 */
export function SafeImage({ src, alt, className, ...props }: SafeImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <Home className="size-8" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
