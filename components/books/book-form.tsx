"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { booksApi } from "@/lib/api";
import { authorsApi } from "@/lib/api/authors";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, Search, ChevronDown } from "lucide-react";
import { useCategories } from "@/lib/hooks";
import type { Book, BookFormData, Author } from "@/lib/types";
import { BOOK_LANGUAGES, BOOK_FORMATS } from "@/lib/types/book";
import { toast } from "sonner";
import { SeriesSelector } from "./series-selector";
import { AuthorSelector } from "./author-selector";
import { CategorySelector } from "./category-selector";

const bookSchema = z.object({
  book_id: z.string().min(1, "Book ID is required").max(50, "Book ID must be at most 50 characters"),
  isbn: z.string().min(10, "ISBN must be at least 10 characters"),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().optional(),
  publication_year: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  category_id: z.number().optional(),
  description: z.string().optional(),
  total_copies: z.number().min(1, "Must have at least 1 copy"),
  location: z.string().optional(),
  language: z.string().optional(),
  pages: z.number().optional(),
  edition: z.string().optional(),
  format: z.enum(["physical", "ebook", "audiobook"]).optional(),
  series_id: z.number().optional().nullable(),
  series_number: z.number().optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [suggestedGenre, setSuggestedGenre] = useState<string | undefined>();
  const { categories } = useCategories();

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
          book_id: book.book_id || "",
          isbn: book.isbn || "",
          title: book.title || "",
          author: book.author || "",
          publisher: book.publisher || "",
          publication_year: book.publication_year,
          category: book.category || book.genre || "",
          description: book.description || "",
          total_copies: book.total_copies || 1,
          location: book.location || book.shelf_location || "",
          language: book.language || "",
          pages: book.pages,
          edition: book.edition || "",
          format: book.format || "physical",
          series_id: book.series_id || null,
          series_number: book.series_number,
          cover_image_url: book.cover_image_url || "",
        }
      : {
          book_id: "",
          isbn: "",
          total_copies: 1,
          category: "",
          format: "physical",
          cover_image_url: "",
        },
  });

  const isbn = watch("isbn");
  const seriesId = watch("series_id");
  const language = watch("language");
  const format = watch("format");

  const handleISBNLookup = async () => {
    if (!isbn || isbn.length < 10) {
      toast.error("Please enter a valid ISBN");
      return;
    }

    setIsLookingUp(true);
    setError(null);

    try {
      const result = await booksApi.lookupISBN(isbn);

      // Fill in basic book details (field names match backend ISBNBookInfo)
      if (result.title) setValue("title", result.title);
      if (result.authors) setValue("author", result.authors);
      if (result.publisher) setValue("publisher", result.publisher);
      if (result.published_year) setValue("publication_year", result.published_year);
      if (result.description) setValue("description", result.description);
      if (result.page_count) setValue("pages", result.page_count);
      if (result.language) setValue("language", result.language);
      if (result.cover_image_url) setValue("cover_image_url", result.cover_image_url);

      // Try to match genre with existing categories
      if (result.genre) {
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase() === result.genre?.toLowerCase()
        );
        if (matchedCategory) {
          setValue("category", matchedCategory.name);
          setValue("category_id", matchedCategory.id);
          setSuggestedGenre(undefined); // Clear suggestion if matched
        } else {
          // Show as suggestion if no match found
          setSuggestedGenre(result.genre);
        }
      }

      // Auto-create authors if they don't exist
      if (result.authors) {
        const authorNames = parseAuthorNames(result.authors);
        const createdAuthors: Author[] = [];

        for (const authorName of authorNames) {
          try {
            // Try to find existing author first
            const existingAuthors = await authorsApi.search(authorName, 1, 10);
            const exactMatch = existingAuthors.data.find(
              (a) => a.name.toLowerCase() === authorName.toLowerCase()
            );

            if (exactMatch) {
              createdAuthors.push(exactMatch);
            } else {
              // Create new author
              const newAuthor = await authorsApi.create({ name: authorName });
              createdAuthors.push(newAuthor);
            }
          } catch {
            // If author operations fail, just continue with text field
            console.debug(`Could not process author: ${authorName}`);
          }
        }

        if (createdAuthors.length > 0) {
          setSelectedAuthors(createdAuthors);
        }
      }

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

  // Helper function to parse author names from various formats
  const parseAuthorNames = (authorString: string): string[] => {
    // Handle common separators: comma, "and", "&", semicolon
    return authorString
      .split(/[,;&]|\s+and\s+/i)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  };

  const handleSeriesChange = (
    newSeriesId: number | null,
    newSeriesNumber?: number
  ) => {
    setValue("series_id", newSeriesId);
    if (newSeriesNumber !== undefined) {
      setValue("series_number", newSeriesNumber);
    }
  };

  const handleAuthorsChange = (authors: Author[]) => {
    setSelectedAuthors(authors);
    // Set primary author name for the main author field
    if (authors.length > 0) {
      setValue("author", authors.map((a) => a.name).join(", "));
    }
  };

  const handleCategoryChange = (categoryName: string, categoryId?: number) => {
    setValue("category", categoryName);
    if (categoryId) {
      setValue("category_id", categoryId);
    }
  };

  const handleSuggestionUsed = () => {
    setSuggestedGenre(undefined);
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

      {/* Essential Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="book_id">Book ID *</Label>
          <Input
            id="book_id"
            placeholder="BK-001"
            {...register("book_id")}
            disabled={isEditing}
          />
          {errors.book_id && (
            <p className="text-sm text-destructive">{errors.book_id.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Unique identifier for this book (e.g., BK-001)
          </p>
        </div>

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

        <div className="space-y-2 sm:col-span-2">
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

        <div className="space-y-2 sm:col-span-2">
          <AuthorSelector
            selectedAuthors={selectedAuthors}
            onChange={handleAuthorsChange}
            disabled={isLoading}
          />
          <input type="hidden" {...register("author")} />
          {errors.author && (
            <p className="text-sm text-destructive">{errors.author.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Select existing authors or create new ones. Order determines primary author.
          </p>
        </div>

        <div className="space-y-2">
          <CategorySelector
            value={watch("category")}
            categoryId={watch("category_id")}
            onChange={handleCategoryChange}
            disabled={isLoading}
            suggestedGenre={suggestedGenre}
            onSuggestionUsed={handleSuggestionUsed}
          />
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
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
      </div>

      {/* Series Selection */}
      <div className="space-y-2">
        <SeriesSelector
          value={seriesId}
          onChange={handleSeriesChange}
          seriesNumber={watch("series_number")}
          onSeriesNumberChange={(num) => setValue("series_number", num)}
          disabled={isLoading}
        />
      </div>

      {/* Publishing Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Label htmlFor="edition">Edition</Label>
          <Input
            id="edition"
            placeholder="1st Edition"
            {...register("edition")}
          />
        </div>
      </div>

      {/* Format and Language */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select
            value={format}
            onValueChange={(value) =>
              setValue("format", value as "physical" | "ebook" | "audiobook")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {BOOK_FORMATS.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={language || ""}
            onValueChange={(value) => setValue("language", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {BOOK_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Advanced Options (Collapsible) */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="w-full justify-between">
            Additional Details
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="location">Shelf Location</Label>
            <Input
              id="location"
              placeholder="Shelf A-1"
              {...register("location")}
            />
            <p className="text-xs text-muted-foreground">
              Physical location in the library (e.g., Shelf A-1, Row 3)
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              type="url"
              placeholder="https://example.com/cover.jpg"
              {...register("cover_image_url")}
            />
            {errors.cover_image_url && (
              <p className="text-xs text-destructive">{errors.cover_image_url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              URL to the book cover image (auto-filled from ISBN lookup)
            </p>
            {watch("cover_image_url") && (
              <div className="mt-2">
                <img
                  src={watch("cover_image_url")}
                  alt="Book cover preview"
                  className="h-32 w-auto rounded border object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
