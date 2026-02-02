"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useBook } from "@/lib/hooks/use-books";
import { useSeriesById } from "@/lib/hooks/use-series";
import { booksApi } from "@/lib/api";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BookCopiesList } from "@/components/books/book-copies-list";
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  MapPin,
  Calendar,
  Building2,
  Languages,
  FileText,
  Library,
  Tablet,
  Headphones,
  QrCode,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { BOOK_LANGUAGES, BOOK_FORMATS } from "@/lib/types/book";

const DESCRIPTION_WORD_LIMIT = 80;

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { isLibrarian, isAdmin } = useAuth();
  const bookId = params.id as string;

  const { book, isLoading, error } = useBook(bookId);
  const { series: bookSeries } = useSeriesById(book?.series_id ?? null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await booksApi.delete(bookId);
      // Invalidate all books-related SWR cache
      await mutate(
        (key) => {
          if (typeof key === "string") return key.startsWith("/api/v1/books");
          if (Array.isArray(key) && typeof key[0] === "string") {
            return key[0].startsWith("/api/v1/books");
          }
          return false;
        },
        undefined,
        { revalidate: false }
      );
      toast.success("Book deleted successfully");
      router.push("/books");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete book"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!book) return;
    setIsDownloadingQR(true);
    try {
      const blob = await apiClient.download(`/api/v1/books/${book.id}/qr`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `book-${book.book_id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download QR code"
      );
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const getLanguageName = (code?: string) => {
    if (!code) return null;
    return BOOK_LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  const getFormatLabel = (value?: string) => {
    if (!value) return null;
    return BOOK_FORMATS.find((f) => f.value === value)?.label || value;
  };

  const getFormatIcon = (format?: string) => {
    switch (format) {
      case "ebook":
        return Tablet;
      case "audiobook":
        return Headphones;
      default:
        return BookOpen;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-6">
          {/* Cover + Title row */}
          <div className="flex gap-4 sm:gap-6">
            <Skeleton className="w-[100px] sm:w-[150px] lg:w-[180px] aspect-[2/3] rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton className="h-7 sm:h-8 w-full max-w-md" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="hidden sm:block h-6 w-28 mt-3" />
              <Skeleton className="hidden sm:block h-10 w-36 mt-4" />
            </div>
          </div>
          {/* Mobile badges/button */}
          <div className="sm:hidden space-y-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-px w-full" />
          {/* Metadata grid */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Book not found</h2>
        <p className="text-muted-foreground mt-2">
          The book you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-4">
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;
  const FormatIcon = getFormatIcon(book.format);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
        {isLibrarian && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="sm:size-auto sm:px-3"
              onClick={handleDownloadQR}
              disabled={isDownloadingQR}
            >
              {isDownloadingQR ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <QrCode className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">QR Code</span>
            </Button>
            <Button variant="outline" size="icon" className="sm:size-auto sm:px-3" asChild>
              <Link href={`/books/${book.id}/edit`}>
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                size="icon"
                className="sm:size-auto sm:px-3"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="space-y-6">
        {/* Cover Image + Title/Author Row - Always side by side */}
        <div className="flex gap-4 sm:gap-6">
          {/* Cover Image */}
          <div className="shrink-0">
            <div className="relative w-[100px] sm:w-[150px] lg:w-[180px] rounded-lg overflow-hidden shadow-md">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  width={180}
                  height={270}
                  className="w-full h-auto"
                  priority
                />
              ) : (
                <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                  <FormatIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Title, Author, Badges, Actions */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{book.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-1">
                by {book.author}
              </p>
              {/* Series Info */}
              {bookSeries && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Library className="h-4 w-4" />
                  {bookSeries.name}
                  {book.series_number && ` - Book ${book.series_number}`}
                </p>
              )}

              {/* Badges - hidden on mobile, shown on sm+ */}
              <div className="hidden sm:flex flex-wrap gap-2 mt-3">
                <Badge
                  variant={isAvailable ? "default" : "secondary"}
                  className="text-sm"
                >
                  {isAvailable
                    ? `${book.available_copies} of ${book.total_copies} available`
                    : "Unavailable"}
                </Badge>
                {book.format && book.format !== "physical" && (
                  <Badge variant="outline" className="text-sm gap-1">
                    <FormatIcon className="h-3 w-3" />
                    {getFormatLabel(book.format)}
                  </Badge>
                )}
              </div>

              {book.average_rating && book.average_rating > 0 && (
                <div className="hidden sm:flex items-center gap-2 mt-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(book.average_rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {book.average_rating.toFixed(1)}
                  </span>
                  {book.total_ratings && (
                    <span className="text-sm text-muted-foreground">
                      ({book.total_ratings})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Borrow button - hidden on mobile */}
            <div className="hidden sm:block mt-4">
              {isAvailable ? (
                <Button asChild>
                  <Link href={`/transactions/borrow?book_id=${book.id}`}>
                    Borrow This Book
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href={`/reservations?action=create&book_id=${book.id}`}>
                    Reserve This Book
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only: Badges, Rating, and Borrow Button */}
        <div className="sm:hidden space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className="text-sm"
            >
              {isAvailable
                ? `${book.available_copies} of ${book.total_copies} available`
                : "Unavailable"}
            </Badge>
            {book.format && book.format !== "physical" && (
              <Badge variant="outline" className="text-sm gap-1">
                <FormatIcon className="h-3 w-3" />
                {getFormatLabel(book.format)}
              </Badge>
            )}
          </div>

          {book.average_rating && book.average_rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(book.average_rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {book.average_rating.toFixed(1)}
              </span>
              {book.total_ratings && (
                <span className="text-sm text-muted-foreground">
                  ({book.total_ratings})
                </span>
              )}
            </div>
          )}

          {isAvailable ? (
            <Button asChild className="w-full">
              <Link href={`/transactions/borrow?book_id=${book.id}`}>
                Borrow This Book
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="w-full">
              <Link href={`/reservations?action=create&book_id=${book.id}`}>
                Reserve This Book
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        {/* Book Metadata */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">ISBN</p>
                <p className="font-medium truncate">{book.isbn}</p>
              </div>
            </div>

            {book.category && (
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium truncate">{book.category}</p>
                </div>
              </div>
            )}

            {book.publisher && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Publisher</p>
                  <p className="font-medium truncate">{book.publisher}</p>
                </div>
              </div>
            )}

            {book.publication_year && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-medium">{book.publication_year}</p>
                </div>
              </div>
            )}

            {book.edition && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Edition</p>
                  <p className="font-medium truncate">{book.edition}</p>
                </div>
              </div>
            )}

            {book.language && (
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{getLanguageName(book.language)}</p>
                </div>
              </div>
            )}

            {book.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium truncate">{book.location}</p>
                </div>
              </div>
            )}

            {(book.pages || book.page_count) && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium">{book.pages || book.page_count} pages</p>
                </div>
              </div>
            )}
          </div>

        {/* Description */}
        {book.description && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              {(() => {
                const words = book.description.split(/\s+/);
                const isLong = words.length > DESCRIPTION_WORD_LIMIT;
                const displayText = isLong && !isDescriptionExpanded
                  ? words.slice(0, DESCRIPTION_WORD_LIMIT).join(" ") + "..."
                  : book.description;

                return (
                  <>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {displayText}
                    </p>
                    {isLong && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      >
                        {isDescriptionExpanded ? (
                          <>
                            Show less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* Book Copies - Librarian Only */}
      {isLibrarian && (
        <BookCopiesList
          bookId={parseInt(bookId)}
          bookCode={book.book_id}
          bookTitle={book.title}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Book"
        description={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
