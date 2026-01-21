"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { BookForm } from "@/components/books";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { Book } from "@/lib/types";

export default function NewBookPage() {
  const router = useRouter();
  const { isLibrarian } = useAuth();

  const handleSuccess = (book: Book) => {
    router.push(`/books/${book.id}`);
  };

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/books">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Book</h1>
            <p className="text-muted-foreground">
              Add a new book to the library catalog
            </p>
          </div>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
            <CardDescription>
              Enter the book information below. You can use the ISBN lookup to
              auto-fill details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookForm
              onSuccess={handleSuccess}
              onCancel={() => router.push("/books")}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
