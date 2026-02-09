"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { transactionsApi, studentsApi, finesApi } from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ScanLine,
  BookOpen,
  User,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  Hash,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BarcodeScanResult, BarcodeScanResponse, BookCondition, Student } from "@/lib/types";

const CONDITIONS: { value: BookCondition; label: string; description: string }[] = [
  { value: "excellent", label: "Excellent", description: "Like new, no visible wear" },
  { value: "good", label: "Good", description: "Minor wear, fully functional" },
  { value: "fair", label: "Fair", description: "Moderate wear, still usable" },
  { value: "poor", label: "Poor", description: "Significant wear, needs attention" },
  { value: "damaged", label: "Damaged", description: "Requires repair or replacement" },
];

function getConditionColor(condition: string): string {
  switch (condition) {
    case "excellent":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
    case "good":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200";
    case "fair":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
    case "poor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200";
    case "damaged":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
    case "borrowed":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
    case "lost":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    case "damaged":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
  }
}

function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

type OperationMode = "idle" | "borrow" | "return";

interface TransactionRecord {
  type: "borrow" | "return";
  bookTitle: string;
  barcode: string;
  studentName?: string;
  timestamp: Date;
  overdueDays?: number;
}

export default function QuickScanPage() {
  const { user } = useAuth();

  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResponse, setScanResponse] = useState<BarcodeScanResponse | null>(null);
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<OperationMode>("idle");
  const [continuousMode, setContinuousMode] = useState(false);

  // Transaction history for current session
  const [sessionHistory, setSessionHistory] = useState<TransactionRecord[]>([]);

  // Borrow mode state
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const debouncedStudentSearch = useDebounce(studentSearch, 300);

  // Return mode state
  const [returnCondition, setReturnCondition] = useState<BookCondition>("good");
  const [conditionNotes, setConditionNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finePerDay, setFinePerDay] = useState<number>(50); // Default KSH 50, fetched from API

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const studentSearchRef = useRef<HTMLDivElement>(null);

  // Derived: are we in copy selection mode?
  const showCopySelection = scanResponse && scanResponse.is_isbn_scan && scanResponse.results.length > 1 && !scanResult;

  // Focus barcode input on mount and after transactions
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Fetch fine rate from API on mount
  useEffect(() => {
    finesApi.getStatistics().then((stats) => {
      if (stats?.fine_per_day) {
        setFinePerDay(stats.fine_per_day);
      }
    }).catch(() => {
      // Keep default fine rate on error
    });
  }, []);

  // Handle barcode scan
  const handleScan = useCallback(async () => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResponse(null);
    setScanResult(null);
    setMode("idle");
    setSelectedStudent(null);
    setStudentSearch("");

    try {
      const response = await transactionsApi.scanBarcode(barcode.trim());
      setScanResponse(response);

      // If single result (direct barcode match or ISBN with 1 copy), auto-select
      if (response.results.length === 1) {
        selectCopy(response.results[0]);
      }
      // If multiple results (ISBN scan), show copy selection UI
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan barcode");
      setScanResponse(null);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  }, [barcode]);

  // Select a specific copy from the list
  const selectCopy = (copy: BarcodeScanResult) => {
    setScanResult(copy);

    // Auto-detect mode based on copy status
    if (copy.is_borrowed) {
      setMode("return");
      if (copy.condition) {
        setReturnCondition(copy.condition as BookCondition);
      }
    } else if (copy.can_borrow) {
      setMode("borrow");
    } else {
      setError(`This copy cannot be borrowed (status: ${copy.status})`);
    }
  };

  // Go back to copy selection
  const backToCopySelection = () => {
    setScanResult(null);
    setMode("idle");
    setSelectedStudent(null);
    setStudentSearch("");
    setReturnCondition("good");
    setConditionNotes("");
    setError(null);
  };

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
        const results = await studentsApi.search({
          query: debouncedStudentSearch.trim(),
          per_page: 5,
        });
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
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(event.target as Node)
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle borrow submission
  const handleBorrow = async () => {
    if (!scanResult || !selectedStudent) {
      setError("Please select a student");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await transactionsApi.borrowByBarcode({
        barcode: scanResult.barcode,
        student_id: selectedStudent.id,
        librarian_id: user?.id || 0,
      });

      const record: TransactionRecord = {
        type: "borrow",
        bookTitle: scanResult.book_title,
        barcode: scanResult.barcode,
        studentName: selectedStudent.name,
        timestamp: new Date(),
      };
      setSessionHistory((prev) => [record, ...prev]);

      toast.success(`${scanResult.book_title} borrowed by ${selectedStudent.name}`);

      if (continuousMode) {
        resetForNextScan();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process borrow");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle return submission
  const handleReturn = async () => {
    if (!scanResult || !scanResult.current_borrower) {
      setError("No active transaction found");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await transactionsApi.returnByBarcode({
        barcode: scanResult.barcode,
        return_condition: returnCondition,
        condition_notes: conditionNotes || undefined,
      });

      const daysOverdue = calculateDaysOverdue(scanResult.current_borrower.due_date);
      const record: TransactionRecord = {
        type: "return",
        bookTitle: scanResult.book_title,
        barcode: scanResult.barcode,
        studentName: scanResult.current_borrower.student_name,
        timestamp: new Date(),
        overdueDays: daysOverdue > 0 ? daysOverdue : undefined,
      };
      setSessionHistory((prev) => [record, ...prev]);

      toast.success(`${scanResult.book_title} returned successfully`);

      if (continuousMode) {
        resetForNextScan();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process return");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset for next scan
  const resetForNextScan = () => {
    setBarcode("");
    setScanResponse(null);
    setScanResult(null);
    setMode("idle");
    setSelectedStudent(null);
    setStudentSearch("");
    setReturnCondition("good");
    setConditionNotes("");
    setError(null);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // Calculate fine preview for returns
  const daysOverdue =
    scanResult?.current_borrower && mode === "return"
      ? calculateDaysOverdue(scanResult.current_borrower.due_date)
      : 0;
  const estimatedFine = daysOverdue * finePerDay;

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quick Scan</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Scan a barcode to borrow or return books instantly
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border px-3 py-2">
            <Label htmlFor="continuous" className="text-sm font-medium cursor-pointer select-none">
              Continuous
            </Label>
            <Switch
              id="continuous"
              checked={continuousMode}
              onCheckedChange={setContinuousMode}
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column: Scanner + Book Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Barcode Input */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ScanLine className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Scan Barcode</CardTitle>
                    <CardDescription>Enter or scan a book copy barcode or ISBN</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Scan or type barcode..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      disabled={isScanning}
                      className="pl-10 h-12 text-base sm:text-lg font-mono"
                      autoFocus
                    />
                    {barcode && !isScanning && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => {
                          setBarcode("");
                          barcodeInputRef.current?.focus();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleScan}
                    disabled={isScanning || !barcode.trim()}
                    size="lg"
                    className="h-12 px-6"
                  >
                    {isScanning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Scan</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Alert variant={error.includes("overdue") ? "default" : "destructive"}
                className={error.includes("overdue") ? "border-amber-500 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-500" : ""}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {error.includes("overdue") && (
                    <span className="block mt-1 text-xs">Return overdue books before borrowing new ones.</span>
                  )}
                  {error.includes("unpaid fines") && (
                    <span className="block mt-1 text-xs">
                      <Link href="/fines" className="underline font-medium">Go to Fines</Link> to pay outstanding fines.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Copy Selection: when ISBN scan returns multiple copies */}
            {showCopySelection && scanResponse && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Select a Copy</CardTitle>
                      <CardDescription>
                        ISBN matched {scanResponse.results.length} copies — select the one to process
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForNextScan}
                      className="text-muted-foreground"
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Book info header */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="h-10 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{scanResponse.results[0].book_title}</h3>
                      <p className="text-xs text-muted-foreground">
                        by {scanResponse.results[0].book_author}
                      </p>
                      {scanResponse.results[0].isbn && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          ISBN: {scanResponse.results[0].isbn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Copy grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scanResponse.results.map((copy) => {
                      const overdue = copy.current_borrower
                        ? calculateDaysOverdue(copy.current_borrower.due_date)
                        : 0;

                      return (
                        <button
                          key={copy.copy_id}
                          onClick={() => selectCopy(copy)}
                          className={cn(
                            "flex flex-col gap-2 p-3 rounded-lg border text-left transition-all",
                            "hover:border-primary/50 hover:bg-muted/30 active:scale-[0.98]",
                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-medium truncate">
                              {copy.barcode}
                            </span>
                            <div className="flex gap-1 shrink-0">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] capitalize", getStatusColor(copy.status))}
                              >
                                {copy.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] capitalize", getConditionColor(copy.condition))}
                              >
                                {copy.condition}
                              </Badge>
                            </div>
                          </div>

                          {copy.current_borrower && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{copy.current_borrower.student_name}</span>
                              <span className="text-muted-foreground/60">·</span>
                              <span className="flex items-center gap-0.5 shrink-0">
                                <Calendar className="h-3 w-3" />
                                {formatDate(copy.current_borrower.due_date)}
                              </span>
                              {overdue > 0 && (
                                <Badge variant="destructive" className="text-[10px] h-4 shrink-0">
                                  {overdue}d overdue
                                </Badge>
                              )}
                            </div>
                          )}

                          {!copy.current_borrower && copy.status === "available" && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready to check out
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan Result: Book Info (after copy is selected) */}
            {scanResult && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {scanResponse?.is_isbn_scan && scanResponse.results.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -ml-1"
                          onClick={backToCopySelection}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge
                        className={cn(
                          "text-sm font-medium",
                          mode === "borrow"
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                            : "bg-amber-500 hover:bg-amber-600 text-white border-0"
                        )}
                      >
                        {mode === "borrow" ? "Checkout" : "Return"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForNextScan}
                      className="text-muted-foreground"
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Book Details */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="h-14 w-11 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{scanResult.book_title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        by {scanResult.book_author}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Hash className="h-3 w-3" />
                          {scanResult.book_code}
                        </span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Copy className="h-3 w-3" />
                          {scanResult.barcode}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize", getConditionColor(scanResult.condition))}
                        >
                          {scanResult.condition}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Current Borrower (for returns) */}
                  {mode === "return" && scanResult.current_borrower && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {scanResult.current_borrower.student_name}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {scanResult.current_borrower.student_code}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              Due: {formatDate(scanResult.current_borrower.due_date)}
                            </span>
                            {daysOverdue > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Action Panel */}
          <div className="lg:col-span-2 space-y-4">
            {scanResult && mode !== "idle" ? (
              <Card className="lg:sticky lg:top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {mode === "borrow" ? "Checkout Book" : "Return Book"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "borrow"
                      ? "Select a student to complete the checkout"
                      : "Assess condition and complete the return"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mode === "borrow" && (
                    <>
                      {/* Student Search */}
                      {!selectedStudent ? (
                        <div className="space-y-2">
                          <Label>Student</Label>
                          <div className="relative" ref={studentSearchRef}>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Search by name or ID..."
                                value={studentSearch}
                                onChange={(e) => {
                                  setStudentSearch(e.target.value);
                                  setError(null);
                                }}
                                onFocus={() => {
                                  if (studentResults.length > 0) {
                                    setShowStudentDropdown(true);
                                  }
                                }}
                                className="pl-10"
                              />
                              {isSearchingStudent && (
                                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                              )}
                            </div>

                            {showStudentDropdown && studentResults.length > 0 && (
                              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-[240px] overflow-auto">
                                {studentResults.map((student) => {
                                  const canBorrow =
                                    student.status === "active" &&
                                    student.current_books < student.max_books &&
                                    student.unpaid_fines === 0;

                                  return (
                                    <button
                                      key={student.id}
                                      className={cn(
                                        "flex w-full items-center gap-3 p-3 text-left transition-colors border-b last:border-b-0",
                                        canBorrow
                                          ? "hover:bg-muted/50 cursor-pointer"
                                          : "opacity-50 cursor-not-allowed"
                                      )}
                                      onClick={() => {
                                        if (canBorrow) {
                                          setSelectedStudent(student);
                                          setShowStudentDropdown(false);
                                        } else {
                                          let reason = "";
                                          if (student.status !== "active")
                                            reason = "Account not active";
                                          else if (student.current_books >= student.max_books)
                                            reason = "Max books reached";
                                          else if (student.unpaid_fines > 0)
                                            reason = "Has unpaid fines";
                                          setError(`Cannot borrow: ${reason}`);
                                        }
                                      }}
                                    >
                                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {student.student_id}
                                        </p>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <Badge variant="outline" className="text-xs">
                                          {student.current_books}/{student.max_books}
                                        </Badge>
                                        {student.unpaid_fines > 0 && (
                                          <Badge variant="destructive" className="text-xs">
                                            Fine
                                          </Badge>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Student</Label>
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-primary/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{selectedStudent.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedStudent.student_id} · {selectedStudent.current_books}/{selectedStudent.max_books} books
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => {
                                setSelectedStudent(null);
                                setStudentSearch("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBorrow}
                        disabled={isSubmitting || !selectedStudent}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Complete Checkout
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {mode === "return" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="condition">Return Condition</Label>
                        <Select
                          value={returnCondition}
                          onValueChange={(value) =>
                            setReturnCondition(value as BookCondition)
                          }
                        >
                          <SelectTrigger id="condition">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{c.label}</span>
                                  <span className="text-muted-foreground text-xs">— {c.description}</span>
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
                          placeholder="Describe any damage or issues..."
                          value={conditionNotes}
                          onChange={(e) => setConditionNotes(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      {/* Overdue Warning */}
                      {daysOverdue > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>KSH {estimatedFine.toLocaleString()}</strong> fine ({daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue at KSH {finePerDay}/day)
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Return Summary */}
                      <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                        <h4 className="text-sm font-medium">Summary</h4>
                        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                          <span className="text-muted-foreground">Condition:</span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs capitalize w-fit", getConditionColor(returnCondition))}
                          >
                            {returnCondition}
                          </Badge>
                          {daysOverdue > 0 && (
                            <>
                              <span className="text-muted-foreground">Overdue:</span>
                              <span className="text-destructive font-medium">
                                {daysOverdue} day{daysOverdue !== 1 ? "s" : ""}
                              </span>
                              <span className="text-muted-foreground">Fine:</span>
                              <span className="text-destructive font-medium">
                                KSH {estimatedFine.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleReturn}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Complete Return
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Placeholder when no scan result */
              <Card className="lg:sticky lg:top-6">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <ScanLine className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {showCopySelection
                      ? "Select a copy from the list"
                      : "Scan a barcode to get started"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                    {showCopySelection
                      ? "Tap a copy card to proceed with borrow or return"
                      : "The system will automatically detect whether to check out or return the book"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Session Activity ({sessionHistory.length})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSessionHistory([])}
                    >
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {sessionHistory.map((record, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className={cn(
                          "p-1 rounded-full mt-0.5 shrink-0",
                          record.type === "borrow"
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-green-100 dark:bg-green-900/50"
                        )}>
                          <CheckCircle2 className={cn(
                            "h-3.5 w-3.5",
                            record.type === "borrow"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-green-600 dark:text-green-400"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-xs">
                            {record.bookTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.type === "borrow" ? "Checked out to" : "Returned by"}{" "}
                            {record.studentName}
                            {record.overdueDays && record.overdueDays > 0 && (
                              <span className="text-destructive ml-1">
                                ({record.overdueDays}d overdue)
                              </span>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[10px] shrink-0",
                          record.type === "borrow"
                            ? "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                            : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                        )}>
                          {record.type === "borrow" ? "OUT" : "IN"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {sessionHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                        <Link href="/transactions">
                          View All Transactions
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
