"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useBooks } from "@/lib/hooks/use-books";
import { BookList, BookSearch } from "@/components/books";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { Book, BookSearchParams } from "@/lib/types";

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLibrarian } = useAuth();

  // Derive params from URL search params
  const urlParams = useMemo<BookSearchParams>(() => ({
    page: Number(searchParams.get("page")) || 1,
    per_page: 20,
    query: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    available: searchParams.get("available") === "true" || undefined,
    sort_by: searchParams.get("sort_by") || "title",
  }), [searchParams]);

  const [localParams, setLocalParams] = useState<Partial<BookSearchParams>>({});

  // Merge URL params with local overrides
  const params = useMemo(() => ({ ...urlParams, ...localParams }), [urlParams, localParams]);

  const { books, pagination, isLoading } = useBooks(params);

  const handleSearch = (newSearchParams: Record<string, string | undefined>) => {
    setLocalParams((prev) => ({
      ...prev,
      ...newSearchParams,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", String(page));
    router.push(`/books?${newParams.toString()}`);
    setLocalParams((prev) => ({ ...prev, page }));
  };

  const handleBorrow = (book: Book) => {
    router.push(`/transactions/borrow?book_id=${book.id}`);
  };

  const handleReserve = (book: Book) => {
    router.push(`/reservations?action=create&book_id=${book.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">
            Browse and search the library catalog
          </p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/books/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
          </div>
        )}
      </div>

      <BookSearch onSearch={handleSearch} />

      <BookList
        books={books}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        showActions={true}
        onBorrow={handleBorrow}
        onReserve={handleReserve}
        emptyMessage="No books match your search criteria."
        emptyAction={
          isLibrarian ? (
            <Button asChild>
              <Link href="/books/new">
                <Plus className="mr-2 h-4 w-4" />
                Add First Book
              </Link>
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-5 w-48 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <Skeleton className="aspect-[2/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
