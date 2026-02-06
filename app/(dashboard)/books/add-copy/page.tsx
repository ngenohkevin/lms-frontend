"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { booksApi } from "@/lib/api/books";
import { bookCopiesApi } from "@/lib/api/book-copies";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import type { Book, BookCopy, CopyCondition } from "@/lib/types/book";

const CONDITIONS: { value: CopyCondition; label: string; description: string }[] = [
  { value: "excellent", label: "Excellent", description: "Like new, no wear" },
  { value: "good", label: "Good", description: "Minor wear, fully functional" },
  { value: "fair", label: "Fair", description: "Noticeable wear, readable" },
  { value: "poor", label: "Poor", description: "Heavy wear, may have damage" },
  { value: "damaged", label: "Damaged", description: "Significant damage" },
];

export default function AddCopyPage() {
  // Form state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [count, setCount] = useState(1);
  const [condition, setCondition] = useState<CopyCondition>("good");
  const [notes, setNotes] = useState("");

  // UI state
  const [bookSearchOpen, setBookSearchOpen] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [lastResult, setLastResult] = useState<{
    book: Book;
    copies: BookCopy[];
    count: number;
  } | null>(null);

  // Search for books when query changes
  useEffect(() => {
    const searchBooks = async () => {
      if (!bookSearchQuery.trim() || bookSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await booksApi.search({ query: bookSearchQuery, per_page: 10 });
        setSearchResults(result.data || []);
      } catch (error) {
        console.error("Failed to search books:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounce);
  }, [bookSearchQuery]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook) {
      toast.error("Please select a book");
      return;
    }

    if (count < 1 || count > 100) {
      toast.error("Number of copies must be between 1 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookId = typeof selectedBook.id === "string"
        ? parseInt(selectedBook.id, 10)
        : selectedBook.id;

      const copies = await bookCopiesApi.generateCopies(
        bookId,
        count,
        selectedBook.book_id,
        condition
      );

      setLastResult({ book: selectedBook, copies, count });

      toast.success(`${count} ${count === 1 ? "copy" : "copies"} added successfully!`, {
        description: `Added to "${selectedBook.title}"`,
      });

      // Reset form for next entry
      setCount(1);
      setNotes("");
      setCondition("good");
      setSelectedBook(null);
    } catch (error) {
      console.error("Failed to generate copies:", error);
      toast.error("Failed to add copies", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedBook(null);
    setCount(1);
    setCondition("good");
    setNotes("");
    setLastResult(null);
  };

  return (
    <PermissionGuard
      permission={PermissionCodes.BOOKS_CREATE}
      deniedFallback={
        <div className="container max-w-2xl py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="p-4 rounded-full bg-muted">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Permission Required</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You don&apos;t have permission to add book copies. Contact an administrator if you need access.
            </p>
          </div>
        </div>
      }
    >
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add Copies</h1>
          <p className="text-muted-foreground mt-2">
            Select a book and generate copies with auto-assigned barcodes
          </p>
        </div>

        {/* Success State */}
        {lastResult && (
          <Card className="mb-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    {lastResult.count} {lastResult.count === 1 ? "copy" : "copies"} added successfully
                  </p>
                  <p className="text-sm text-green-700/80 dark:text-green-300/80 mt-1">
                    Added to &quot;{lastResult.book.title}&quot;
                  </p>
                  {lastResult.copies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lastResult.copies.slice(0, 10).map((copy) => (
                        <Badge key={copy.id} variant="secondary" className="font-mono text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {copy.barcode}
                        </Badge>
                      ))}
                      {lastResult.copies.length > 10 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          +{lastResult.copies.length - 10} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" asChild className="border-green-300 dark:border-green-800">
                      <Link href={`/books/${lastResult.book.id}`}>
                        View Book
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setLastResult(null)}
                      className="text-green-700 dark:text-green-300"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Book Selection Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Select Book</CardTitle>
                    <CardDescription>
                      Choose which book to add copies to
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Popover open={bookSearchOpen} onOpenChange={setBookSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={bookSearchOpen}
                      className="w-full justify-between h-auto min-h-12 py-2"
                    >
                      {selectedBook ? (
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-1.5 rounded bg-muted">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{selectedBook.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {selectedBook.author} • {selectedBook.book_id}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Search for a book...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search by title, author, or ISBN..."
                        value={bookSearchQuery}
                        onValueChange={setBookSearchQuery}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : searchResults.length === 0 ? (
                          <CommandEmpty>
                            {bookSearchQuery.length < 2
                              ? "Type to search..."
                              : "No books found."}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {searchResults.map((book) => (
                              <CommandItem
                                key={book.id}
                                value={String(book.id)}
                                onSelect={() => {
                                  setSelectedBook(book);
                                  setBookSearchOpen(false);
                                  setBookSearchQuery("");
                                }}
                                className="flex items-center gap-3 py-3"
                              >
                                <div className="p-1.5 rounded bg-muted shrink-0">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{book.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {book.author}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {book.available_copies}/{book.total_copies}
                                </Badge>
                                {selectedBook?.id === book.id && (
                                  <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Copy Details Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Copy Details</CardTitle>
                    <CardDescription>
                      Set the number of copies, condition, and optional notes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="count">Number of Copies</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Barcodes will be auto-generated for each copy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as CopyCondition)}>
                    <SelectTrigger id="condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.label}</span>
                            <span className="text-muted-foreground">— {c.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special notes about these copies..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isSubmitting || !selectedBook || count < 1}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {count} {count === 1 ? "copy" : "copies"}...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {count} {count === 1 ? "Copy" : "Copies"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
