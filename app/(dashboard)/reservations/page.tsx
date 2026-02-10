"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import { PermissionCodes } from "@/lib/types/permission";
import { reservationsApi, booksApi, studentsApi } from "@/lib/api";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, XCircle, AlertTriangle, Bell, Loader2, Plus, Search, User, Trash2 } from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Reservation, ReservationSearchParams, ReservationStatus, PaginatedResponse, Book, Student } from "@/lib/types";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  ready: "bg-green-500/10 text-green-700 border-green-500/20",
  fulfilled: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  expired: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
};

const statusIcons: Record<ReservationStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  ready: CheckCircle,
  fulfilled: CheckCircle,
  expired: AlertTriangle,
  cancelled: XCircle,
};

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isStudent, user } = useAuth();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PermissionCodes.RESERVATIONS_MANAGE);
  const canViewAll = hasPermission(PermissionCodes.STUDENTS_VIEW); // Can see all students' reservations
  const [params, setParams] = useState<ReservationSearchParams>({
    page: 1,
    per_page: 20,
    student_id: !canViewAll && isStudent ? String(user?.id) : undefined,
  });

  // Create reservation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createBookId, setCreateBookId] = useState<string | null>(null);
  const [createBook, setCreateBook] = useState<Book | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  // Book search state (for manual reservation creation)
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const bookSearchRef = useRef<HTMLDivElement>(null);
  const debouncedBookSearch = useDebounce(bookSearch, 300);

  // Student search state (for librarian)
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const studentSearchRef = useRef<HTMLDivElement>(null);
  const debouncedStudentSearch = useDebounce(studentSearch, 300);

  // Book search effect
  useEffect(() => {
    if (!debouncedBookSearch.trim() || createBook || !showCreateDialog) {
      setBookResults([]);
      setShowBookDropdown(false);
      return;
    }

    const searchBooks = async () => {
      setIsSearchingBook(true);
      try {
        const results = await booksApi.search({ query: debouncedBookSearch.trim(), per_page: 8 });
        setBookResults(results.data);
        setShowBookDropdown(results.data.length > 0);
      } catch {
        setBookResults([]);
        setShowBookDropdown(false);
      } finally {
        setIsSearchingBook(false);
      }
    };
    searchBooks();
  }, [debouncedBookSearch, createBook, showCreateDialog]);

  // Student search effect
  useEffect(() => {
    if (!debouncedStudentSearch.trim() || selectedStudent || !showCreateDialog) {
      setStudentResults([]);
      setShowStudentDropdown(false);
      return;
    }

    const searchStudents = async () => {
      setIsSearchingStudent(true);
      try {
        const results = await studentsApi.search({ query: debouncedStudentSearch.trim(), per_page: 8 });
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
  }, [debouncedStudentSearch, selectedStudent, showCreateDialog]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentSearchRef.current && !studentSearchRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
      if (bookSearchRef.current && !bookSearchRef.current.contains(event.target as Node)) {
        setShowBookDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle URL params for action=create
  useEffect(() => {
    const action = searchParams.get("action");
    const bookId = searchParams.get("book_id");
    if (action === "create" && bookId) {
      setCreateBookId(bookId);
      setShowCreateDialog(true);
    }
  }, [searchParams]);

  // Fetch book details when dialog opens with book_id
  useEffect(() => {
    if (createBookId && showCreateDialog) {
      setIsLoadingBook(true);
      booksApi.get(createBookId)
        .then((book) => setCreateBook(book))
        .catch(() => {
          toast.error("Failed to load book details");
          setShowCreateDialog(false);
        })
        .finally(() => setIsLoadingBook(false));
    }
  }, [createBookId, showCreateDialog]);

  const { data, isLoading, mutate } = useSWR<PaginatedResponse<Reservation>>(
    ["/api/v1/reservations", params],
    () => reservationsApi.list(params)
  );

  const reservations = data?.data;
  const pagination = data?.pagination;

  const handleCreateReservation = async () => {
    if (!createBookId) return;

    setIsCreating(true);
    try {
      // If librarian, they can select a student. If student, use their own ID
      const studentId = canManage && selectedStudent ? selectedStudent.id : user?.id ? String(user.id) : undefined;

      if (!studentId) {
        toast.error("Student ID is required");
        return;
      }

      await reservationsApi.create({
        book_id: createBookId,
        student_id: studentId,
      });

      toast.success("Book reserved successfully");
      handleCloseCreateDialog();
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateBookId(null);
    setCreateBook(null);
    setSelectedStudent(null);
    setStudentSearch("");
    setStudentResults([]);
    setShowStudentDropdown(false);
    setBookSearch("");
    setBookResults([]);
    setShowBookDropdown(false);
    // Clear URL params
    router.replace("/reservations");
  };

  const handleSelectBook = (book: Book) => {
    setCreateBook(book);
    setCreateBookId(book.id);
    setBookSearch("");
    setBookResults([]);
    setShowBookDropdown(false);
  };

  const handleOpenNewReservation = () => {
    setShowCreateDialog(true);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch("");
    setStudentResults([]);
    setShowStudentDropdown(false);
  };

  const handleCancel = async (id: string) => {
    try {
      await reservationsApi.cancel(id);
      mutate();
      toast.success("Reservation cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel reservation");
    }
  };

  const handleFulfill = async (id: string) => {
    try {
      await reservationsApi.fulfill(id);
      mutate();
      toast.success("Reservation fulfilled - book checked out");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fulfill reservation");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reservationsApi.delete(id);
      mutate();
      toast.success("Reservation deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete reservation");
    }
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setParams((prev) => ({ ...prev, query, page: 1 }));
  };

  const columns = [
    {
      key: "book",
      header: "Book",
      render: (res: Reservation) => (
        <div className="flex items-center gap-3">
          <BookCoverImage src={res.book?.cover_url} alt={res.book?.title || "Book"} />
          <div>
            <p className="font-medium line-clamp-1">{res.book?.title || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{res.book?.author}</p>
          </div>
        </div>
      ),
    },
    ...(canViewAll
      ? [
          {
            key: "student",
            header: "Student",
            render: (res: Reservation) => (
              <div>
                <p className="font-medium">{res.student?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {res.student?.student_id}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "queue_position",
      header: "Queue",
      render: (res: Reservation) => (
        <span className="text-sm">
          {/* Show queue position for all active reservations (pending and ready) */}
          {(res.status === "pending" || res.status === "ready") && res.queue_position
            ? `#${res.queue_position}`
            : "-"}
        </span>
      ),
    },
    {
      key: "reserved_at",
      header: "Reserved",
      render: (res: Reservation) => (
        <span className="text-sm">{formatDate(res.reserved_at)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (res: Reservation) => {
        const StatusIcon = statusIcons[res.status];
        return (
          <Badge
            variant="outline"
            className={`gap-1 ${statusColors[res.status]}`}
          >
            <StatusIcon className="h-3 w-3" />
            {res.status}
          </Badge>
        );
      },
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (res: Reservation) => (
        <span className="text-sm">
          {res.expires_at ? formatRelativeTime(res.expires_at) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (res: Reservation) => (
        <div className="flex justify-end gap-2">
          {res.status === "ready" && canManage && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleFulfill(res.id);
              }}
            >
              Fulfill
            </Button>
          )}
          {(res.status === "pending" || res.status === "ready") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(res.id);
              }}
            >
              Cancel
            </Button>
          )}
          {canManage && (res.status === "cancelled" || res.status === "expired" || res.status === "fulfilled") && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(res.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Count ready reservations for the current user
  const readyReservations = reservations?.filter(
    (r) => r.status === "ready" && (!canViewAll ? r.student_id === String(user?.id) : true)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            {canManage
              ? "Manage book reservations"
              : "View your book reservations"}
          </p>
        </div>
        <Button onClick={handleOpenNewReservation} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Ready for Pickup Banner */}
      {readyReservations.length > 0 && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">Ready for Pickup!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            {readyReservations.length === 1
              ? `"${readyReservations[0].book?.title}" is ready for pickup.`
              : `${readyReservations.length} book${readyReservations.length > 1 ? "s are" : " is"} ready for pickup.`}
            {" "}Visit the library to complete your borrowing.
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        data={reservations || []}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={canViewAll ? handleSearch : undefined}
        searchPlaceholder="Search by book title or student..."
        isLoading={isLoading}
        emptyMessage="No reservations found."
      />

      {/* Create Reservation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !open && handleCloseCreateDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve Book</DialogTitle>
            <DialogDescription>
              Reserve this book to be notified when it becomes available.
            </DialogDescription>
          </DialogHeader>

          {isLoadingBook ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : createBook ? (
            <div className="space-y-4 py-4">
              {/* Book Info */}
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-4">
                  <BookCoverImage src={createBook.cover_url} alt={createBook.title} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{createBook.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {createBook.author}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {createBook.available_copies} of {createBook.total_copies} available
                    </p>
                  </div>
                  {/* Allow changing book selection */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreateBook(null);
                      setCreateBookId(null);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Student Selection (librarian only) */}
              {canManage && (
                <div className="space-y-2">
                  <Label>Reserve for Student</Label>
                  {selectedStudent ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{selectedStudent.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedStudent.student_id}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative" ref={studentSearchRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or student ID..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="pl-10"
                        />
                        {isSearchingStudent && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {showStudentDropdown && studentResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {studentResults.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-3"
                              onClick={() => handleSelectStudent(student)}
                            >
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.student_id}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Info for students */}
              {!canManage && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    You will be notified when this book becomes available.
                    Your position in the queue will be shown after reservation.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Book Search */}
              <div className="space-y-2">
                <Label>Search for a Book</Label>
                <div className="relative" ref={bookSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, author, or ISBN..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="pl-10"
                    />
                    {isSearchingBook && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {showBookDropdown && bookResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {bookResults.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-3"
                          onClick={() => handleSelectBook(book)}
                        >
                          <BookCoverImage src={book.cover_url} alt={book.title} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground">by {book.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {book.available_copies} of {book.total_copies} available
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateReservation}
              disabled={isCreating || isLoadingBook || !createBook || (canManage && !selectedStudent)}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reserving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Reserve Book
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
