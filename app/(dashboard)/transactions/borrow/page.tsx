"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSWRConfig } from "swr";
import { transactionsApi, booksApi, studentsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/providers/auth-provider";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  Search,
  BookOpen,
  User,
  CheckCircle,
  X,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { Book, Student, BookCopy } from "@/lib/types";
import { CopySelector } from "@/components/books/copy-selector";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const borrowSchema = z.object({
  due_days: z.number().min(1).max(90).optional(),
  notes: z.string().optional(),
});

type BorrowFormData = z.infer<typeof borrowSchema>;

function BorrowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialBookId = searchParams.get("book_id");
  const initialCopyId = searchParams.get("copy_id");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { mutate: globalMutate } = useSWRConfig();

  // Book lookup
  const [bookSearch, setBookSearch] = useState("");
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(
    initialCopyId ? parseInt(initialCopyId, 10) : null
  );

  // Student lookup
  const [studentSearch, setStudentSearch] = useState("");
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentSearchRef = useRef<HTMLDivElement>(null);
  const debouncedStudentSearch = useDebounce(studentSearch, 300);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      due_days: 14,
    },
  });

  // Auto-load book if book_id is provided in URL
  useEffect(() => {
    if (initialBookId && !selectedBook) {
      const loadBook = async () => {
        setIsSearchingBook(true);
        try {
          const book = await booksApi.get(initialBookId);
          if (book.available_copies >= 1) {
            setSelectedBook(book);
            setBookSearch(book.book_id || initialBookId);
          } else {
            setError("This book is not available for borrowing");
          }
        } catch {
          setError("Book not found");
        } finally {
          setIsSearchingBook(false);
        }
      };
      loadBook();
    }
  }, [initialBookId]);

  // Auto-search students when typing
  useEffect(() => {
    if (!debouncedStudentSearch.trim() || selectedStudent) {
      setStudentResults([]);
      setShowStudentDropdown(false);
      return;
    }

    const searchStudents = async () => {
      setIsSearchingStudent(true);
      try {
        const results = await studentsApi.search({ query: debouncedStudentSearch.trim(), per_page: 10 });
        setStudentResults(results.data);
        setShowStudentDropdown(results.data.length > 0);
      } catch {
        setStudentResults([]);
        setShowStudentDropdown(false);
      } finally {
        setIsSearchingStudent(false);
      }
    };
    searchStudents();
  }, [debouncedStudentSearch, selectedStudent]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentSearchRef.current && !studentSearchRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if search term looks like a direct ID (numeric, ISBN, or book code)
  const isDirectIdPattern = (term: string): boolean => {
    // Pure numeric ID
    if (/^\d+$/.test(term)) return true;
    // ISBN pattern (10 or 13 digits, with optional hyphens)
    if (/^[\d-]{10,17}$/.test(term) && /\d{10,13}/.test(term.replace(/-/g, ""))) return true;
    // Book codes like "BK-001", "BK001", "ISBN-123"
    if (/^[A-Z]{1,4}-?\d+$/i.test(term)) return true;
    return false;
  };

  // Search for book by ISBN, ID, or title
  const handleBookSearch = async () => {
    const searchTerm = bookSearch.trim();
    if (!searchTerm) return;

    setIsSearchingBook(true);
    setError(null);

    // Helper to handle book selection
    const handleBookResult = (book: Book) => {
      if (book.available_copies < 1) {
        setError("This book is not available for borrowing");
        setSelectedBook(null);
      } else {
        setSelectedBook(book);
      }
    };

    // Helper to handle search results
    const handleSearchResults = (results: { data: Book[] }) => {
      if (results.data.length === 1) {
        handleBookResult(results.data[0]);
      } else if (results.data.length > 1) {
        setError("Multiple books found. Please use the exact book ID or be more specific.");
        setSelectedBook(null);
      } else {
        setError("Book not found");
        setSelectedBook(null);
      }
    };

    try {
      if (isDirectIdPattern(searchTerm)) {
        // Try direct lookup first for ID-like patterns
        try {
          const book = await booksApi.get(searchTerm);
          handleBookResult(book);
        } catch {
          // Fall back to search if direct lookup fails
          const results = await booksApi.search({ query: searchTerm });
          handleSearchResults(results);
        }
      } else {
        // Go straight to search for text queries (avoid 404s)
        const results = await booksApi.search({ query: searchTerm });
        handleSearchResults(results);
      }
    } catch {
      setError("Book not found");
      setSelectedBook(null);
    } finally {
      setIsSearchingBook(false);
    }
  };

  // Select student from search results
  const handleSelectStudent = useCallback((student: Student) => {
    setError(null);

    // Check status-specific conditions
    if (student.status === "suspended") {
      const reason = student.suspension_reason
        ? `: ${student.suspension_reason}`
        : "";
      setError(`Student is suspended${reason}. Cannot borrow books.`);
      setSelectedStudent(null);
    } else if (student.status === "graduated") {
      setError("Student has graduated and cannot borrow books.");
      setSelectedStudent(null);
    } else if (student.status === "inactive") {
      setError("Student account is inactive. Cannot borrow books.");
      setSelectedStudent(null);
    } else if (student.status !== "active") {
      setError(`Student account is ${student.status}. Cannot borrow books.`);
      setSelectedStudent(null);
    } else if (student.current_books >= student.max_books) {
      setError("Student has reached maximum borrowing limit. Cannot borrow more books.");
      setSelectedStudent(null);
    } else if (student.unpaid_fines > 0) {
      // Block selection for students with unpaid fines - they must pay fines first
      setError(
        `Student has unpaid fines of KSH ${Math.round(student.unpaid_fines).toLocaleString()}. Fines must be paid before borrowing.`
      );
      setSelectedStudent(null);
    } else {
      setSelectedStudent(student);
    }

    setStudentSearch("");
    setStudentResults([]);
    setShowStudentDropdown(false);
  }, []);

  // Clear selected student
  const handleClearStudent = useCallback(() => {
    setSelectedStudent(null);
    setStudentSearch("");
    setStudentResults([]);
    setShowStudentDropdown(false);
    setError(null);
  }, []);

  const onSubmit = async (data: BorrowFormData) => {
    if (!selectedBook || !selectedStudent) {
      setError("Please select both a book and a student");
      return;
    }

    if (!selectedCopy) {
      setError("Please select a specific copy to borrow");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create AbortController for race condition protection
    const abortController = new AbortController();

    try {
      // Re-validate student and book data before submit to handle race conditions
      // where another librarian may have processed a transaction
      const [revalidatedStudent, revalidatedBook] = await Promise.all([
        studentsApi.get(selectedStudent.id),
        booksApi.get(selectedBook.id),
      ]);

      // Check if student still meets borrowing criteria
      if (revalidatedStudent.status === "suspended") {
        const reason = revalidatedStudent.suspension_reason
          ? `: ${revalidatedStudent.suspension_reason}`
          : "";
        setError(`Student is now suspended${reason}. Cannot borrow books.`);
        setSelectedStudent(null);
        return;
      }
      if (revalidatedStudent.status === "graduated") {
        setError("Student has graduated and cannot borrow books.");
        setSelectedStudent(null);
        return;
      }
      if (revalidatedStudent.status !== "active") {
        setError(`Student account is now ${revalidatedStudent.status}. Cannot borrow books.`);
        setSelectedStudent(null);
        return;
      }
      if (revalidatedStudent.current_books >= revalidatedStudent.max_books) {
        setError("Student has reached maximum borrowing limit. Cannot borrow more books.");
        setSelectedStudent(null);
        return;
      }
      if (revalidatedStudent.unpaid_fines > 0) {
        setError(`Student has unpaid fines of KSH ${Math.round(revalidatedStudent.unpaid_fines).toLocaleString()}. Fines must be paid before borrowing.`);
        setSelectedStudent(null);
        return;
      }

      // Check if book is still available
      if (revalidatedBook.available_copies <= 0) {
        setError("This book is no longer available for borrowing.");
        setSelectedBook(null);
        return;
      }

      // Check if abort was requested
      if (abortController.signal.aborted) {
        return;
      }

      // Proceed with borrowing
      await transactionsApi.borrow({
        book_id: selectedBook.id,
        student_id: selectedStudent.id,
        librarian_id: user?.id || 0,
        copy_id: selectedCopy.id,
        due_days: data.due_days,
        notes: data.notes,
      });

      setSuccess(true);
      toast.success("Book borrowed successfully");

      // Invalidate related caches so other views refresh
      globalMutate(
        (key) =>
          typeof key === "string" &&
          (key.startsWith("/api/v1/transactions") ||
            key.startsWith("/api/v1/books") ||
            key.startsWith("/api/v1/students")),
        undefined,
        { revalidate: true }
      );
    } catch (err) {
      if (abortController.signal.aborted) {
        return;
      }
      setError(
        err instanceof Error ? err.message : "Failed to process transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Transaction Complete!</h2>
        <p className="text-muted-foreground mb-6">
          <strong>{selectedBook?.title}</strong> has been borrowed by{" "}
          <strong>{selectedStudent?.name}</strong>.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setSelectedBook(null);
              setSelectedCopy(null);
              setSelectedCopyId(null);
              setSelectedStudent(null);
              setBookSearch("");
              setStudentSearch("");
            }}
          >
            New Transaction
          </Button>
          <Button asChild>
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Borrow Book</h1>
        <p className="text-muted-foreground">
          Process a new book borrowing transaction
        </p>
      </div>

      <div className="max-w-2xl space-y-6 isolate">
        {/* Step 1: Book & Copy Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              1. Select Book & Copy
            </CardTitle>
            <CardDescription>
              Search by book ID, ISBN, or title
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[120px]">
            {!selectedBook ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter book ID or ISBN"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBookSearch()}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <Button
                  variant="outline"
                  onClick={handleBookSearch}
                  disabled={isSearchingBook}
                  className="shrink-0"
                >
                  {isSearchingBook ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <>
                {/* Selected Book Display */}
                <div className="relative rounded-lg border p-4 bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 cursor-pointer text-xs h-7 px-2"
                    onClick={() => {
                      setSelectedBook(null);
                      setSelectedCopy(null);
                      setSelectedCopyId(null);
                    }}
                  >
                    Change
                  </Button>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      {selectedBook.cover_url ? (
                        <Image
                          src={selectedBook.cover_url}
                          alt={selectedBook.title}
                          width={80}
                          height={120}
                          className="w-[60px] sm:w-[80px] h-auto rounded-md shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-[60px] sm:w-[80px] aspect-[2/3] rounded-md bg-muted flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-14 sm:pr-16">
                      <p className="font-medium leading-snug">{selectedBook.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedBook.author}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                        ISBN: {selectedBook.isbn || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <Badge variant="outline">
                      {selectedBook.available_copies} available
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedBook.book_id}
                    </span>
                  </div>
                </div>

                {/* Copy Selection - inline below book */}
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Copy className="h-4 w-4" />
                    Select Copy
                  </Label>
                  <CopySelector
                    bookId={parseInt(selectedBook.id, 10)}
                    value={selectedCopy?.id ?? selectedCopyId ?? undefined}
                    onSelect={(copy) => {
                      setSelectedCopy(copy);
                      setSelectedCopyId(copy?.id ?? null);
                    }}
                    showOnlyAvailable={true}
                    placeholder="Select an available copy..."
                  />
                  {selectedCopy && (
                    <div className="mt-3 rounded-lg border p-3 bg-background">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Copy #{selectedCopy.copy_number}</p>
                          {selectedCopy.barcode && (
                            <p className="text-xs text-muted-foreground font-mono">
                              Barcode: {selectedCopy.barcode}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            selectedCopy.condition === "excellent"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : selectedCopy.condition === "good"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : selectedCopy.condition === "fair"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : selectedCopy.condition === "poor"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {selectedCopy.condition}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              2. Select Student
            </CardTitle>
            <CardDescription>
              Search by name, student ID, or email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[80px]">
            {!selectedStudent && (
              <div className="relative" ref={studentSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Type student name, ID, or email..."
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      // Clear any previous student-related errors when starting a new search
                      setError(null);
                      if (!e.target.value.trim()) {
                        setShowStudentDropdown(false);
                      }
                    }}
                    onFocus={() => {
                      if (studentResults.length > 0) {
                        setShowStudentDropdown(true);
                      }
                    }}
                    className="pl-10 pr-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4">
                    {isSearchingStudent && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {studentSearch && !isSearchingStudent && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSearch("");
                          setStudentResults([]);
                          setShowStudentDropdown(false);
                          setError(null);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {showStudentDropdown && studentResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg max-h-[250px] overflow-auto overscroll-contain">
                    {studentResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 active:bg-muted transition-colors border-b last:border-b-0"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {student.student_id} • {student.email}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant={student.status === "active" ? "outline" : "secondary"} className="text-xs">
                              {student.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {student.current_books}/{student.max_books} books
                            </Badge>
                            {student.unpaid_fines > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                KSH {Math.round(student.unpaid_fines).toLocaleString()} fine
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showStudentDropdown && studentResults.length === 0 && studentSearch.trim() && !isSearchingStudent && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg p-4 text-center text-muted-foreground">
                    No students found matching &quot;{studentSearch}&quot;
                  </div>
                )}
              </div>
            )}

            {selectedStudent && (
              <div className="flex items-start gap-4 rounded-lg border p-4 bg-muted/50">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.student_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.email}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {selectedStudent.current_books} / {selectedStudent.max_books}{" "}
                      books
                    </Badge>
                    {selectedStudent.unpaid_fines > 0 && (
                      <Badge variant="destructive">
                        KSH {Math.round(selectedStudent.unpaid_fines).toLocaleString()} unpaid
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleClearStudent}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>3. Transaction Details</CardTitle>
            <CardDescription>
              Set the due date and add any notes
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="due_days">Loan Period (days)</Label>
                <Input
                  id="due_days"
                  type="number"
                  min={1}
                  max={90}
                  {...register("due_days", { valueAsNumber: true })}
                />
                {errors.due_days && (
                  <p className="text-sm text-destructive">
                    {errors.due_days.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special notes for this transaction..."
                {...register("notes")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedBook || !selectedCopy || !selectedStudent}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Transaction"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function BorrowPage() {
  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-16 w-64" />
            <div className="max-w-2xl space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        }
      >
        <BorrowContent />
      </Suspense>
    </AuthGuard>
  );
}
