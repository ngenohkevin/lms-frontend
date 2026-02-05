"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Barcode,
  BookOpen,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";
import { booksApi } from "@/lib/api/books";
import { bookCopiesApi } from "@/lib/api/book-copies";
import type { Book, CopyCondition } from "@/lib/types/book";

const CONDITIONS: { value: CopyCondition; label: string; description: string }[] = [
  { value: "excellent", label: "Excellent", description: "Like new, no wear" },
  { value: "good", label: "Good", description: "Minor wear, fully functional" },
  { value: "fair", label: "Fair", description: "Noticeable wear, readable" },
  { value: "poor", label: "Poor", description: "Heavy wear, may have damage" },
  { value: "damaged", label: "Damaged", description: "Significant damage" },
];

export default function AddCopyPage() {
  const router = useRouter();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [barcode, setBarcode] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [condition, setCondition] = useState<CopyCondition>("good");
  const [notes, setNotes] = useState("");
  const [copyNumber, setCopyNumber] = useState("");

  // UI state
  const [bookSearchOpen, setBookSearchOpen] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barcodeStatus, setBarcodeStatus] = useState<"idle" | "checking" | "valid" | "exists">("idle");

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

  // Auto-generate copy number when book is selected
  useEffect(() => {
    if (selectedBook) {
      const bookCode = selectedBook.book_id || `BK${selectedBook.id}`;
      const timestamp = Date.now().toString(36).toUpperCase();
      setCopyNumber(`${bookCode}-${timestamp}`);
    } else {
      setCopyNumber("");
    }
  }, [selectedBook]);

  // Check if barcode already exists
  const checkBarcode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setBarcodeStatus("idle");
      return;
    }

    setBarcodeStatus("checking");
    try {
      await bookCopiesApi.scanBarcode(code);
      // If we get here, barcode exists
      setBarcodeStatus("exists");
      toast.error("This barcode is already assigned to another copy");
    } catch {
      // Barcode doesn't exist - this is good!
      setBarcodeStatus("valid");
    }
  }, []);

  // Handle barcode input
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    setBarcodeStatus("idle");
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcode.trim()) {
      e.preventDefault();
      checkBarcode(barcode);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook) {
      toast.error("Please select a book");
      return;
    }

    if (!barcode.trim()) {
      toast.error("Please scan or enter a barcode");
      barcodeInputRef.current?.focus();
      return;
    }

    if (!copyNumber.trim()) {
      toast.error("Copy number is required");
      return;
    }

    if (barcodeStatus === "exists") {
      toast.error("This barcode is already in use");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookId = typeof selectedBook.id === "string"
        ? parseInt(selectedBook.id, 10)
        : selectedBook.id;

      await bookCopiesApi.create(bookId, {
        copy_number: copyNumber,
        barcode: barcode.trim(),
        condition,
        notes: notes.trim() || undefined,
      });

      toast.success("Copy added successfully!", {
        description: `Added copy to "${selectedBook.title}"`,
      });

      // Reset form for next entry
      setBarcode("");
      setBarcodeStatus("idle");
      setNotes("");
      // Keep book selected for adding multiple copies
      barcodeInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create copy:", error);
      toast.error("Failed to add copy", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setBarcode("");
    setSelectedBook(null);
    setCondition("good");
    setNotes("");
    setCopyNumber("");
    setBarcodeStatus("idle");
    barcodeInputRef.current?.focus();
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add Book Copy</h1>
        <p className="text-muted-foreground mt-2">
          Scan a barcode and assign it to a book in your collection
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Barcode Scanner Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Barcode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Scan Barcode</CardTitle>
                  <CardDescription>
                    Scan or enter the barcode for the new copy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcode}
                    onChange={handleBarcodeChange}
                    onKeyDown={handleBarcodeKeyDown}
                    onBlur={() => barcode && checkBarcode(barcode)}
                    placeholder="Scan barcode or type manually..."
                    className={cn(
                      "pl-10 pr-10 h-12 text-lg font-mono",
                      barcodeStatus === "valid" && "border-green-500 focus-visible:ring-green-500",
                      barcodeStatus === "exists" && "border-red-500 focus-visible:ring-red-500"
                    )}
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {barcodeStatus === "checking" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : barcodeStatus === "valid" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : barcodeStatus === "exists" ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <Barcode className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  {barcode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => {
                        setBarcode("");
                        setBarcodeStatus("idle");
                        barcodeInputRef.current?.focus();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {barcodeStatus === "exists" && (
                  <p className="text-sm text-red-500">
                    This barcode is already assigned to another copy
                  </p>
                )}
                {barcodeStatus === "valid" && (
                  <p className="text-sm text-green-600">
                    Barcode is available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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
                    Choose which book this copy belongs to
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {selectedBook && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Copy Number:</Label>
                  <Badge variant="outline" className="font-mono">
                    {copyNumber}
                  </Badge>
                  <span className="text-xs text-muted-foreground">(auto-generated)</span>
                </div>
              )}
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
                    Set condition and add optional notes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="Any special notes about this copy..."
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
              disabled={isSubmitting || !selectedBook || !barcode || barcodeStatus === "exists"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Copy...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Copy
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
  );
}
