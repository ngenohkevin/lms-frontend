"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useBook, useBookRatings } from "@/lib/hooks/use-books";
import { useSeriesById } from "@/lib/hooks/use-series";
import { booksApi } from "@/lib/api";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
  Library,
  Tablet,
  Headphones,
  QrCode,
  Download,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { BOOK_LANGUAGES, BOOK_FORMATS } from "@/lib/types/book";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLibrarian, isAdmin } = useAuth();
  const bookId = params.id as string;

  const { book, isLoading, error, refresh } = useBook(bookId);
  const { ratings, isLoading: ratingsLoading } = useBookRatings(bookId);
  const { series: bookSeries } = useSeriesById(book?.series_id ?? null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await booksApi.delete(bookId);
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
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          <Skeleton className="aspect-[3/4] rounded-lg max-w-[200px] lg:max-w-none" />
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              size="sm"
              onClick={handleDownloadQR}
              disabled={isDownloadingQR}
            >
              {isDownloadingQR ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">QR Code</span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/books/${book.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Cover Image */}
        <Card className="overflow-hidden lg:col-span-1 max-w-[200px] lg:max-w-none mx-auto lg:mx-0">
          <div className="relative aspect-[3/4] bg-muted">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FormatIcon className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </Card>

        {/* Book Info */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{book.title}</h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-1">
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
              </div>
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
            </div>

            {book.average_rating && book.average_rating > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(book.average_rating!)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">
                  {book.average_rating.toFixed(1)}
                </span>
                {book.total_ratings && (
                  <span className="text-muted-foreground">
                    ({book.total_ratings} ratings)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
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
                <p className="text-muted-foreground whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs for Ratings, Copies and More */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="details" className="text-sm">
            Reviews ({book.total_ratings || 0})
          </TabsTrigger>
          {isLibrarian && (
            <TabsTrigger value="copies" className="text-sm">
              Copies ({book.total_copies})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reader Reviews</CardTitle>
              <CardDescription>
                See what others are saying about this book
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratingsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ratings && ratings.length > 0 ? (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                        {rating.review && (
                          <p className="mt-2 text-sm break-words">{rating.review}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this book!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isLibrarian && (
          <TabsContent value="copies" className="mt-4">
            <BookCopiesList
              bookId={parseInt(bookId)}
              bookTitle={book.title}
            />
          </TabsContent>
        )}
      </Tabs>

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
