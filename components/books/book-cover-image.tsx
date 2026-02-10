import Image from "next/image";
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

  if (src) {
    return (
      <div className={`${styles.container} rounded overflow-hidden shrink-0 relative`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="40px"
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
