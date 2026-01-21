"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { booksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search } from "lucide-react";
import { BOOK_CATEGORIES } from "@/lib/types/book";
import type { Book, BookFormData, ISBNLookupResult } from "@/lib/types";
import { toast } from "sonner";

const bookSchema = z.object({
  isbn: z.string().min(10, "ISBN must be at least 10 characters"),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().optional(),
  publication_year: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  total_copies: z.number().min(1, "Must have at least 1 copy"),
  location: z.string().optional(),
  language: z.string().optional(),
  pages: z.number().optional(),
});

interface BookFormProps {
  book?: Book;
  onSuccess?: (book: Book) => void;
  onCancel?: () => void;
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!book;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher || "",
          publication_year: book.publication_year,
          category: book.category,
          description: book.description || "",
          total_copies: book.total_copies,
          location: book.location || "",
          language: book.language || "",
          pages: book.pages,
        }
      : {
          total_copies: 1,
          category: "",
        },
  });

  const isbn = watch("isbn");

  const handleISBNLookup = async () => {
    if (!isbn || isbn.length < 10) {
      toast.error("Please enter a valid ISBN");
      return;
    }

    setIsLookingUp(true);
    setError(null);

    try {
      const result = await booksApi.lookupISBN(isbn);

      if (result.title) setValue("title", result.title);
      if (result.author) setValue("author", result.author);
      if (result.publisher) setValue("publisher", result.publisher);
      if (result.publication_year) setValue("publication_year", result.publication_year);
      if (result.description) setValue("description", result.description);
      if (result.pages) setValue("pages", result.pages);
      if (result.language) setValue("language", result.language);

      toast.success("Book information loaded from ISBN");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to lookup ISBN. Please enter details manually."
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: Book;

      if (isEditing) {
        result = await booksApi.update(book.id, data);
        toast.success("Book updated successfully");
      } else {
        result = await booksApi.create(data);
        toast.success("Book created successfully");
      }

      onSuccess?.(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} book`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN *</Label>
          <div className="flex gap-2">
            <Input
              id="isbn"
              placeholder="978-0-123456-78-9"
              {...register("isbn")}
              className="flex-1"
            />
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleISBNLookup}
                disabled={isLookingUp}
              >
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {errors.isbn && (
            <p className="text-sm text-destructive">{errors.isbn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Book title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            placeholder="Author name"
            {...register("author")}
          />
          {errors.author && (
            <p className="text-sm text-destructive">{errors.author.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {BOOK_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            placeholder="Publisher name"
            {...register("publisher")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publication_year">Publication Year</Label>
          <Input
            id="publication_year"
            type="number"
            placeholder="2024"
            {...register("publication_year", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_copies">Total Copies *</Label>
          <Input
            id="total_copies"
            type="number"
            min={1}
            {...register("total_copies", { valueAsNumber: true })}
          />
          {errors.total_copies && (
            <p className="text-sm text-destructive">
              {errors.total_copies.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Shelf A-1"
            {...register("location")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            placeholder="English"
            {...register("language")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pages">Number of Pages</Label>
          <Input
            id="pages"
            type="number"
            placeholder="300"
            {...register("pages", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the book..."
          rows={4}
          {...register("description")}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Book"
          ) : (
            "Create Book"
          )}
        </Button>
      </div>
    </form>
  );
}
