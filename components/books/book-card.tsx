import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, MapPin } from "lucide-react";
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
        <div className="relative aspect-[2/3] bg-muted">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? "default" : "secondary"}>
              {isAvailable ? `${book.available_copies} available` : "Unavailable"}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/books/${book.id}`} className="hover:underline">
          <h3 className="font-semibold line-clamp-2" title={book.title}>
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {book.author}
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          {book.average_rating && book.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{book.average_rating.toFixed(1)}</span>
              {book.total_ratings && (
                <span className="text-xs">({book.total_ratings})</span>
              )}
            </div>
          )}
          {book.category && (
            <Badge variant="outline" className="text-xs">
              {book.category}
            </Badge>
          )}
        </div>
        {book.location && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{book.location}</span>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 gap-2">
          {isAvailable ? (
            <Button size="sm" className="flex-1" onClick={onBorrow}>
              Borrow
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
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
