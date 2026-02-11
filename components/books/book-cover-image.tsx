"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

const sizeStyles = {
  sm: { container: "h-10 w-8", icon: "h-4 w-4" },
  md: { container: "h-14 w-11", icon: "h-6 w-6" },
} as const;

interface BookCoverImageProps {
  src?: string;
  alt: string;
  size?: keyof typeof sizeStyles;
}

export function BookCoverImage({ src, alt, size = "sm" }: BookCoverImageProps) {
  const styles = sizeStyles[size];
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <div className={`${styles.container} rounded overflow-hidden shrink-0 relative`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} rounded bg-muted flex items-center justify-center shrink-0`}>
      <BookOpen className={`${styles.icon} text-muted-foreground`} />
    </div>
  );
}
