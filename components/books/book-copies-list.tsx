"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Barcode,
  Loader2,
  Search,
  X,
  History,
  User,
  Calendar,
  ArrowRightCircle,
  ArrowLeftCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { useBookCopies } from "@/lib/hooks/use-book-copies";
import { bookCopiesApi } from "@/lib/api/book-copies";
import { transactionsApi } from "@/lib/api/transactions";
import type { BookCopy, BookCopyFormData, CopyCondition, CopyStatus } from "@/lib/types/book";
import type { BarcodeScanResult } from "@/lib/types/transaction";
import { COPY_CONDITIONS, COPY_STATUSES } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BookCopyForm } from "./book-copy-form";
import { BarcodePrintDialog } from "./barcode-print-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface BookCopiesListProps {
  bookId: number;
  bookCode: string;
  bookTitle?: string;
}

function getConditionColor(condition: CopyCondition): string {
  switch (condition) {
    case "excellent":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "good":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "fair":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "poor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "damaged":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getStatusColor(status: CopyStatus): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "borrowed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "reserved":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "lost":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "damaged":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

const ITEMS_PER_PAGE = 10;

export function BookCopiesList({ bookId, bookCode, bookTitle }: BookCopiesListProps) {
  const { mutate: globalMutate } = useSWRConfig();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { copies, isLoading, refresh } = useBookCopies(bookId, debouncedSearch || undefined);

  // Revalidate both the copies list and all book-related SWR caches
  const refreshAll = React.useCallback(() => {
    refresh();
    // Revalidate the single book detail (updates available_copies on detail page)
    globalMutate(`/api/v1/books/${bookId}`);
    // Revalidate all book list queries (updates available_copies on books list page)
    globalMutate(
      (key: unknown) =>
        Array.isArray(key) && typeof key[0] === "string" && key[0].startsWith("/api/v1/books"),
      undefined,
      { revalidate: true }
    );
  }, [refresh, globalMutate, bookId]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generateCondition, setGenerateCondition] = useState<string>("good");
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [deletingCopy, setDeletingCopy] = useState<BookCopy | null>(null);
  const [viewingHistoryCopy, setViewingHistoryCopy] = useState<BookCopy | null>(null);
  const [returningCopy, setReturningCopy] = useState<BookCopy | null>(null);
  const [copyBorrowerInfo, setCopyBorrowerInfo] = useState<Map<number, BarcodeScanResult>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isLoadingBorrowerInfo, setIsLoadingBorrowerInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [printFilter, setPrintFilter] = useState<"all" | "unprinted" | "printed">("all");
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printCopies, setPrintCopies] = useState<BookCopy[]>([]);

  // Filter copies by print status
  const filteredCopies = React.useMemo(() => {
    if (printFilter === "unprinted") return copies.filter((c) => !c.barcode_printed_at);
    if (printFilter === "printed") return copies.filter((c) => !!c.barcode_printed_at);
    return copies;
  }, [copies, printFilter]);

  const unprintedCount = React.useMemo(
    () => copies.filter((c) => !c.barcode_printed_at).length,
    [copies]
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCopies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCopies = React.useMemo(
    () => filteredCopies.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filteredCopies, startIndex]
  );

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, printFilter]);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch borrower info for borrowed copies (only for current page)
  // Track which copies we need to fetch - only fetch if not already in cache
  const borrowedCopyIds = React.useMemo(() => {
    return paginatedCopies
      .filter((copy) => copy.status === "borrowed" && copy.barcode)
      .map((copy) => copy.id)
      .sort()
      .join(",");
  }, [paginatedCopies]);

  React.useEffect(() => {
    if (!borrowedCopyIds) {
      setIsLoadingBorrowerInfo(false);
      return;
    }

    const fetchBorrowerInfo = async () => {
      const borrowedCopies = paginatedCopies.filter(
        (copy) => copy.status === "borrowed" && copy.barcode && !copyBorrowerInfo.has(copy.id)
      );
      if (borrowedCopies.length === 0) {
        setIsLoadingBorrowerInfo(false);
        return;
      }

      setIsLoadingBorrowerInfo(true);
      const newInfoMap = new Map(copyBorrowerInfo);

      await Promise.all(
        borrowedCopies.map(async (copy) => {
          if (!copy.barcode) return;
          try {
            const result = await transactionsApi.scanBarcode(copy.barcode);
            newInfoMap.set(copy.id, result);
          } catch {
            // Mark as fetched even on error to prevent infinite retries
            newInfoMap.set(copy.id, {} as BarcodeScanResult);
          }
        })
      );

      setCopyBorrowerInfo(newInfoMap);
      setIsLoadingBorrowerInfo(false);
    };

    fetchBorrowerInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrowedCopyIds]);

  const handleCreate = async (data: BookCopyFormData) => {
    setIsSubmitting(true);
    try {
      await bookCopiesApi.create(bookId, data);
      toast.success("Copy added successfully");
      setIsFormOpen(false);
      refreshAll();
    } catch {
      toast.error("Failed to add copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: BookCopyFormData) => {
    if (!editingCopy) return;
    setIsSubmitting(true);
    try {
      await bookCopiesApi.update(bookId, editingCopy.id, data);
      toast.success("Copy updated successfully");
      setEditingCopy(null);
      refreshAll();
    } catch {
      toast.error("Failed to update copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCopy) return;
    setIsSubmitting(true);
    try {
      await bookCopiesApi.delete(bookId, deletingCopy.id);
      toast.success("Copy deleted successfully");
      setDeletingCopy(null);
      refreshAll();
    } catch {
      toast.error("Failed to delete copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (generateCount < 1) return;
    setIsSubmitting(true);
    try {
      const generated = await bookCopiesApi.generateCopies(bookId, generateCount, bookCode, generateCondition);
      toast.success(`Generated ${generated.length} copies successfully`);
      setIsGenerateOpen(false);
      setGenerateCount(1);
      setGenerateCondition("good");
      refreshAll();
    } catch {
      toast.error("Failed to generate copies");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!returningCopy) return;
    const borrowerInfo = copyBorrowerInfo.get(returningCopy.id);
    if (!borrowerInfo?.current_borrower?.transaction_id) {
      toast.error("Cannot find active transaction for this copy");
      setReturningCopy(null);
      return;
    }

    setIsReturning(true);
    try {
      await transactionsApi.return(String(borrowerInfo.current_borrower.transaction_id));
      toast.success("Book returned successfully");
      setReturningCopy(null);
      // Clear borrower info for this copy
      setCopyBorrowerInfo((prev) => {
        const newMap = new Map(prev);
        newMap.delete(returningCopy.id);
        return newMap;
      });
      refreshAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Book Copies</CardTitle>
            <CardDescription>
              {copies.length} {copies.length === 1 ? "copy" : "copies"}{" "}
              {bookTitle && `of "${bookTitle}"`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {unprintedCount > 0 && (
              <Button
                onClick={() => {
                  const unprinted = copies.filter((c) => !c.barcode_printed_at);
                  setPrintCopies(unprinted);
                  setIsPrintDialogOpen(true);
                }}
                size="sm"
                variant="outline"
              >
                <Printer className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Print Labels</span>
                <Badge className="ml-1.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-1.5 py-0 text-xs">
                  {unprintedCount}
                </Badge>
              </Button>
            )}
            <Button onClick={() => setIsGenerateOpen(true)} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Copy</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by barcode or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 transition-opacity ${
                  searchQuery ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Print status filter */}
          {copies.length > 0 && (
            <div className="mb-4 flex gap-1">
              {(["all", "unprinted", "printed"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={printFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrintFilter(filter)}
                  className="text-xs capitalize"
                >
                  {filter}
                  {filter === "unprinted" && unprintedCount > 0 && (
                    <span className="ml-1 text-[10px]">({unprintedCount})</span>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Content area with min-height to prevent layout shifts */}
          <div className="min-h-[200px]">
            {copies.length === 0 && !debouncedSearch ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Barcode className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No copies registered yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Copy
                </Button>
              </div>
            ) : filteredCopies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {debouncedSearch
                    ? `No copies found for "${debouncedSearch}"`
                    : `No ${printFilter} copies`}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSearchQuery(""); setPrintFilter("all"); }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Borrower / Due</TableHead>
                      <TableHead>Printed</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCopies.map((copy) => (
                      <TableRow key={copy.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {copy.barcode}
                        </TableCell>
                        <TableCell>
                          <Badge className={getConditionColor(copy.condition)}>
                            {COPY_CONDITIONS.find((c) => c.value === copy.condition)
                              ?.label || copy.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(copy.status)}>
                            {COPY_STATUSES.find((s) => s.value === copy.status)
                              ?.label || copy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {copy.status === "borrowed" ? (
                            <div className="flex flex-col gap-1">
                              {copyBorrowerInfo.get(copy.id)?.current_borrower ? (
                                <>
                                  <div className="flex items-center gap-1 text-sm">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">
                                      {copyBorrowerInfo.get(copy.id)?.current_borrower?.student_name}
                                    </span>
                                    <span className="text-muted-foreground">
                                      ({copyBorrowerInfo.get(copy.id)?.current_borrower?.student_code})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Due: {new Date(copyBorrowerInfo.get(copy.id)?.current_borrower?.due_date || "").toLocaleDateString()}
                                  </div>
                                </>
                              ) : isLoadingBorrowerInfo ? (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Loading...
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {copy.barcode_printed_at ? (
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <Check className="h-3.5 w-3.5" />
                              {new Date(copy.barcode_printed_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not printed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {copy.status === "available" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/borrow?book_id=${bookId}&copy_id=${copy.id}`}>
                                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                                    Checkout
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {copy.status === "borrowed" && copyBorrowerInfo.get(copy.id)?.current_borrower && (
                                <DropdownMenuItem
                                  onClick={() => setReturningCopy(copy)}
                                >
                                  <ArrowLeftCircle className="mr-2 h-4 w-4" />
                                  Return Book
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setPrintCopies([copy]);
                                  setIsPrintDialogOpen(true);
                                }}
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                {copy.barcode_printed_at ? "Reprint Label" : "Print Label"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setViewingHistoryCopy(copy)}
                              >
                                <History className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingCopy(copy)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingCopy(copy)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedCopies.map((copy) => (
                  <div
                    key={copy.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    {/* Header row - always same height */}
                    <div className="flex items-center justify-between h-10">
                      <div className="flex flex-col">
                        <span className="font-medium font-mono text-sm">{copy.barcode}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {copy.status === "available" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/transactions/borrow?book_id=${bookId}&copy_id=${copy.id}`}>
                                <ArrowRightCircle className="mr-2 h-4 w-4" />
                                Checkout
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {copy.status === "borrowed" && copyBorrowerInfo.get(copy.id)?.current_borrower && (
                            <DropdownMenuItem onClick={() => setReturningCopy(copy)}>
                              <ArrowLeftCircle className="mr-2 h-4 w-4" />
                              Return Book
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setPrintCopies([copy]);
                              setIsPrintDialogOpen(true);
                            }}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            {copy.barcode_printed_at ? "Reprint Label" : "Print Label"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setViewingHistoryCopy(copy)}>
                            <History className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingCopy(copy)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingCopy(copy)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Badges row - always same height */}
                    <div className="flex flex-wrap gap-2 min-h-[28px]">
                      <Badge className={getConditionColor(copy.condition)}>
                        {COPY_CONDITIONS.find((c) => c.value === copy.condition)
                          ?.label || copy.condition}
                      </Badge>
                      <Badge className={getStatusColor(copy.status)}>
                        {COPY_STATUSES.find((s) => s.value === copy.status)
                          ?.label || copy.status}
                      </Badge>
                      {copy.barcode_printed_at ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Printed
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Unprinted
                        </Badge>
                      )}
                    </div>
                    {/* Borrower info for borrowed copies */}
                    {copy.status === "borrowed" && copyBorrowerInfo.get(copy.id)?.current_borrower && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-2 space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {copyBorrowerInfo.get(copy.id)?.current_borrower?.student_name}
                          </span>
                          <span className="text-blue-600/70 dark:text-blue-400/70">
                            ({copyBorrowerInfo.get(copy.id)?.current_borrower?.student_code})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(copyBorrowerInfo.get(copy.id)?.current_borrower?.due_date || "").toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCopies.length)} of {filteredCopies.length} copies
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Add Copy Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Copy</DialogTitle>
            <DialogDescription>
              Register a new copy of this book
            </DialogDescription>
          </DialogHeader>
          <BookCopyForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Copy Dialog */}
      <Dialog open={!!editingCopy} onOpenChange={() => setEditingCopy(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Copy</DialogTitle>
            <DialogDescription>
              Update copy information for {editingCopy?.barcode}
            </DialogDescription>
          </DialogHeader>
          {editingCopy && (
            <BookCopyForm
              initialData={editingCopy}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              onCancel={() => setEditingCopy(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCopy} onOpenChange={() => setDeletingCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Copy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete copy &quot;{deletingCopy?.barcode}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Confirmation */}
      <AlertDialog open={!!returningCopy} onOpenChange={() => setReturningCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return Book?</AlertDialogTitle>
            <AlertDialogDescription>
              Return copy &quot;{returningCopy?.barcode}&quot; borrowed by{" "}
              {copyBorrowerInfo.get(returningCopy?.id || 0)?.current_borrower?.student_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReturning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturn}
              disabled={isReturning}
            >
              {isReturning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Return Book"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Copies Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate Copies</DialogTitle>
            <DialogDescription>
              Automatically create multiple copies with sequential numbering.
              Copies will be named {bookCode}-COPY-001, {bookCode}-COPY-002, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Copies</Label>
              <input
                id="count"
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={generateCondition}
                onValueChange={setGenerateCondition}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {COPY_CONDITIONS.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isSubmitting || generateCount < 1}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${generateCount} ${generateCount === 1 ? "Copy" : "Copies"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Print Dialog */}
      <BarcodePrintDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        copies={printCopies}
        bookTitle={bookTitle}
        onPrinted={refreshAll}
      />

      {/* Copy History Dialog */}
      <Dialog open={!!viewingHistoryCopy} onOpenChange={() => setViewingHistoryCopy(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy History</DialogTitle>
            <DialogDescription>
              Borrowing history for {viewingHistoryCopy?.barcode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewingHistoryCopy && copyBorrowerInfo.get(viewingHistoryCopy.id)?.current_borrower ? (
              <div className="space-y-3">
                <div className="font-medium text-sm">Currently Borrowed</div>
                <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">
                      {copyBorrowerInfo.get(viewingHistoryCopy.id)?.current_borrower?.student_name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Student ID: {copyBorrowerInfo.get(viewingHistoryCopy.id)?.current_borrower?.student_code}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {new Date(copyBorrowerInfo.get(viewingHistoryCopy.id)?.current_borrower?.due_date || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active borrowing</p>
                <p className="text-xs mt-1">This copy is currently available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingHistoryCopy(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BookCopiesList;
