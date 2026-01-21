"use client";

import { BookCard } from "./book-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Library, ChevronLeft, ChevronRight } from "lucide-react";
import type { Book, Pagination } from "@/lib/types";

interface BookListProps {
  books?: Book[];
  pagination?: Pagination;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  onBorrow?: (book: Book) => void;
  onReserve?: (book: Book) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function BookList({
  books,
  pagination,
  isLoading,
  onPageChange,
  showActions = false,
  onBorrow,
  onReserve,
  emptyMessage = "No books found.",
  emptyAction,
}: BookListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="No books found"
        description={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showActions={showActions}
            onBorrow={() => onBorrow?.(book)}
            onReserve={() => onReserve?.(book)}
          />
        ))}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.per_page + 1} to{" "}
            {Math.min(pagination.page * pagination.per_page, pagination.total)}{" "}
            of {pagination.total} books
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.has_prev}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
