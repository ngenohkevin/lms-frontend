"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transactionsApi, booksApi, studentsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
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
} from "lucide-react";
import { toast } from "sonner";
import type { Book, Student } from "@/lib/types";

const borrowSchema = z.object({
  due_days: z.number().min(1).max(90).optional(),
  notes: z.string().optional(),
});

type BorrowFormData = z.infer<typeof borrowSchema>;

function BorrowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBookId = searchParams.get("book_id");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Book lookup
  const [bookSearch, setBookSearch] = useState("");
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Student lookup
  const [studentSearch, setStudentSearch] = useState("");
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  // Search for student by ID or registration number
  const handleStudentSearch = async () => {
    if (!studentSearch.trim()) return;

    setIsSearchingStudent(true);
    setError(null);

    try {
      const student = await studentsApi.getByStudentId(studentSearch.trim());
      if (student.status !== "active") {
        setError(`Student account is ${student.status}`);
        setSelectedStudent(null);
      } else if (student.current_books >= student.max_books) {
        setError("Student has reached maximum borrowing limit");
        setSelectedStudent(null);
      } else if (student.unpaid_fines > 0) {
        setError(
          `Student has unpaid fines of $${student.unpaid_fines.toFixed(2)}`
        );
        // Still allow selection but show warning
        setSelectedStudent(student);
      } else {
        setSelectedStudent(student);
      }
    } catch {
      try {
        // Try by internal ID
        const student = await studentsApi.get(studentSearch.trim());
        if (student.status !== "active") {
          setError(`Student account is ${student.status}`);
          setSelectedStudent(null);
        } else if (student.current_books >= student.max_books) {
          setError("Student has reached maximum borrowing limit");
          setSelectedStudent(null);
        } else {
          setSelectedStudent(student);
        }
      } catch {
        setError("Student not found");
        setSelectedStudent(null);
      }
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const onSubmit = async (data: BorrowFormData) => {
    if (!selectedBook || !selectedStudent) {
      setError("Please select both a book and a student");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await transactionsApi.borrow({
        book_id: selectedBook.id,
        student_id: selectedStudent.id,
        due_days: data.due_days,
        notes: data.notes,
      });

      setSuccess(true);
      toast.success("Book borrowed successfully");
    } catch (err) {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Borrow Book</h1>
          <p className="text-muted-foreground">
            Process a new book borrowing transaction
          </p>
        </div>
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
              <div className="flex items-start gap-4 rounded-lg border p-4 bg-muted/50">
                <div className="h-16 w-12 rounded bg-muted flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedBook.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBook.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ISBN: {selectedBook.isbn}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedBook.available_copies} available
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBook(null)}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Student
            </CardTitle>
            <CardDescription>
              Search by student ID or registration number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter student ID"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
              />
              <Button
                variant="outline"
                onClick={handleStudentSearch}
                disabled={isSearchingStudent}
              >
                {isSearchingStudent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

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
                  onClick={() => setSelectedStudent(null)}
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
              <Button variant="outline" asChild>
                <Link href="/transactions">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedBook || !selectedStudent}
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
