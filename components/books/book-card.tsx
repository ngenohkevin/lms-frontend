import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, Star, Calendar, Hash, AlertTriangle } from "lucide-react";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const hasNoCopies = book.total_copies === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link href={`/books/${book.id}`} className="block">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {book.cover_url ? (
            <>
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <BookOpen className="h-10 w-10 text-primary/30 mx-auto mb-2" />
                <span className="text-xs text-muted-foreground">No Cover</span>
              </div>
            </div>
          )}

          {/* Availability badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium shadow-sm",
                isAvailable
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                  : hasNoCopies
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                    : "bg-muted/90 backdrop-blur-sm"
              )}
            >
              {isAvailable
                ? `${book.available_copies} available`
                : hasNoCopies
                  ? "No copies"
                  : "Unavailable"}
            </Badge>
          </div>

          {/* Rating badge (if available) */}
          {book.average_rating && book.average_rating > 0 && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-sm text-white border-0 gap-1"
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {book.average_rating.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* Quick info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-xs line-clamp-2 drop-shadow-md">
              {book.description || "No description available"}
            </p>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 flex-1">
        <Link href={`/books/${book.id}`} className="block group/title">
          <h3
            className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover/title:text-primary transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          by {book.author}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1 font-mono">
          <Hash className="h-3 w-3" />
          {book.book_id}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {book.category && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
            >
              {book.category}
            </Badge>
          )}
          {book.publication_year && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {book.publication_year}
            </span>
          )}
        </div>

        {book.location && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary/60" />
            <span>{book.location}</span>
          </div>
        )}
      </CardContent>

      {/* Notice for books with no copies */}
      {hasNoCopies && (
        <CardFooter className="p-4 pt-0">
          <Link
            href={`/books/${book.id}`}
            className="flex items-center gap-1.5 w-full rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Add copies to make available</span>
          </Link>
        </CardFooter>
      )}

      {showActions && !hasNoCopies && (
        <CardFooter className="p-4 pt-0">
          {isAvailable ? (
            <Button
              size="sm"
              className="w-full font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onBorrow?.();
              }}
            >
              Borrow Now
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full font-medium cursor-pointer border-primary/20 hover:bg-primary/5"
              onClick={(e) => {
                e.preventDefault();
                onReserve?.();
              }}
            >
              Reserve
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
