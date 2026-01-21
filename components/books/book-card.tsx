import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin } from "lucide-react";
import type { Book } from "@/lib/types";

interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  onReserve?: () => void;
  showActions?: boolean;
}

export function BookCard({
  book,
  onBorrow,
  onReserve,
  showActions = false,
}: BookCardProps) {
  const isAvailable = book.available_copies > 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/books/${book.id}`}>
        <div className="relative aspect-[4/5] bg-muted">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5">
            <Badge variant={isAvailable ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
              {isAvailable ? `${book.available_copies} avail` : "N/A"}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-3">
        <Link href={`/books/${book.id}`} className="hover:underline">
          <h3 className="font-semibold text-sm line-clamp-1" title={book.title}>
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {book.author}
        </p>
        {book.category && (
          <Badge variant="outline" className="text-xs mt-1.5 px-1.5 py-0">
            {book.category}
          </Badge>
        )}
        {book.location && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{book.location}</span>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="p-3 pt-0">
          {isAvailable ? (
            <Button size="sm" className="w-full h-7 text-xs" onClick={onBorrow}>
              Borrow
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={onReserve}
            >
              Reserve
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
