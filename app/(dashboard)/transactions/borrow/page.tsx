"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

  // Search for book by ISBN or ID
  const handleBookSearch = async () => {
    if (!bookSearch.trim()) return;

    setIsSearchingBook(true);
    setError(null);

    try {
      const book = await booksApi.get(bookSearch.trim());
      if (book.available_copies < 1) {
        setError("This book is not available for borrowing");
        setSelectedBook(null);
      } else {
        setSelectedBook(book);
      }
    } catch (err) {
      try {
        // Try searching by ISBN
        const results = await booksApi.search({ query: bookSearch.trim() });
        if (results.data.length === 1) {
          const book = results.data[0];
          if (book.available_copies < 1) {
            setError("This book is not available for borrowing");
            setSelectedBook(null);
          } else {
            setSelectedBook(book);
          }
        } else if (results.data.length > 1) {
          setError("Multiple books found. Please use the exact book ID.");
          setSelectedBook(null);
        } else {
          setError("Book not found");
          setSelectedBook(null);
        }
      } catch {
        setError("Book not found");
        setSelectedBook(null);
      }
    } finally {
      setIsSearchingBook(false);
    }
  };

  // Select student from search results
  const handleSelectStudent = useCallback((student: Student) => {
    setError(null);

    if (student.status !== "active") {
      setError(`Student account is ${student.status}. Cannot borrow books.`);
      setSelectedStudent(null);
    } else if (student.current_books >= student.max_books) {
      setError("Student has reached maximum borrowing limit. Cannot borrow more books.");
      setSelectedStudent(null);
    } else if (student.unpaid_fines > 0) {
      // Block selection for students with unpaid fines - they must pay fines first
      setError(
        `Student has unpaid fines of $${student.unpaid_fines.toFixed(2)}. Fines must be paid before borrowing.`
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
        setError(`Student has unpaid fines of $${revalidatedStudent.unpaid_fines.toFixed(2)}. Fines must be paid before borrowing.`);
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
        notes: data.notes,
      });

      setSuccess(true);
      toast.success("Book borrowed successfully");
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Book Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Book
            </CardTitle>
            <CardDescription>
              Search by book ID, ISBN, or title
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter book ID or ISBN"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBookSearch()}
              />
              <Button
                variant="outline"
                onClick={handleBookSearch}
                disabled={isSearchingBook}
              >
                {isSearchingBook ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {selectedBook && (
              <div className="flex gap-4 rounded-lg border p-4 bg-muted/50">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">{selectedBook.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedBook.author}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    ISBN: {selectedBook.isbn || "N/A"}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedBook.available_copies} available
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setSelectedBook(null);
                    setSelectedCopy(null);
                    setSelectedCopyId(null);
                  }}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Selection - Only show when book is selected */}
        {selectedBook && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Select Copy
              </CardTitle>
              <CardDescription>
                Choose which copy to borrow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Copy #{selectedCopy.copy_number}</p>
                      {selectedCopy.barcode && (
                        <p className="text-sm text-muted-foreground font-mono">
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
            </CardContent>
          </Card>
        )}

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Student
            </CardTitle>
            <CardDescription>
              Search by name, student ID, or email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedStudent && (
              <div className="relative" ref={studentSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  />
                  {isSearchingStudent && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {studentSearch && !isSearchingStudent && (
                    <button
                      onClick={() => {
                        setStudentSearch("");
                        setStudentResults([]);
                        setShowStudentDropdown(false);
                        setError(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showStudentDropdown && studentResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-[300px] overflow-auto">
                    {studentResults.map((student) => (
                      <button
                        key={student.id}
                        className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.student_id} • {student.email}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={student.status === "active" ? "outline" : "secondary"} className="text-xs">
                              {student.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {student.current_books}/{student.max_books} books
                            </Badge>
                            {student.unpaid_fines > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                ${student.unpaid_fines.toFixed(2)} fine
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
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-4 text-center text-muted-foreground">
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
                        ${selectedStudent.unpaid_fines.toFixed(2)} unpaid
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearStudent}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
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
  );
}

export default function BorrowPage() {
  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-64" />
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
