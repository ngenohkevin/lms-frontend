"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBook } from "@/lib/hooks/use-books";
import { AuthGuard } from "@/components/auth/auth-guard";
import { BookForm } from "@/components/books/book-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { Book } from "@/lib/types";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const { book, isLoading, error } = useBook(bookId);

  const handleSuccess = (updatedBook: Book) => {
    router.push(`/books/${updatedBook.id}`);
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="max-w-3xl">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (error || !book) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
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
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/books/${book.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
            <p className="text-muted-foreground">
              Update &quot;{book.title}&quot; information
            </p>
          </div>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
            <CardDescription>
              Make changes to the book&apos;s information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookForm
              book={book}
              onSuccess={handleSuccess}
              onCancel={() => router.push(`/books/${book.id}`)}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
