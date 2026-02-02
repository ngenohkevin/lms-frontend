"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { transactionsApi, studentsApi } from "@/lib/api";
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
import {
  ArrowLeft,
  Loader2,
  ScanLine,
  BookOpen,
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { BarcodeScanResult, BookCondition, Student } from "@/lib/types";

const CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "damaged", label: "Damaged" },
];

function getConditionColor(condition: string): string {
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

export default function QuickScanPage() {
  const { user } = useAuth();

  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<OperationMode>("idle");
  const [continuousMode, setContinuousMode] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    type: "borrow" | "return";
    bookTitle: string;
    studentName?: string;
  } | null>(null);

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

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const studentSearchRef = useRef<HTMLDivElement>(null);

  // Focus barcode input on mount and after transactions
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle barcode scan
  const handleScan = useCallback(async () => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setMode("idle");
    setSelectedStudent(null);
    setStudentSearch("");

    try {
      const result = await transactionsApi.scanBarcode(barcode.trim());
      setScanResult(result);

      // Auto-detect mode based on copy status
      if (result.is_borrowed) {
        setMode("return");
        if (result.condition) {
          setReturnCondition(result.condition as BookCondition);
        }
      } else if (result.can_borrow) {
        setMode("borrow");
      } else {
        setError("This copy cannot be borrowed (status: " + result.status + ")");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan barcode");
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  }, [barcode]);

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

      setLastTransaction({
        type: "borrow",
        bookTitle: scanResult.book_title,
        studentName: selectedStudent.name,
      });

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

      setLastTransaction({
        type: "return",
        bookTitle: scanResult.book_title,
        studentName: scanResult.current_borrower.student_name,
      });

      toast.success(`${scanResult.book_title} returned`);

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
  const estimatedFine = daysOverdue * 0.5;

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quick Scan</h1>
              <p className="text-muted-foreground">
                Scan to automatically borrow or return books
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="continuous" className="text-sm">
              Continuous
            </Label>
            <Switch
              id="continuous"
              checked={continuousMode}
              onCheckedChange={setContinuousMode}
            />
          </div>
        </div>

        {/* Last Transaction Notification */}
        {lastTransaction && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>{lastTransaction.bookTitle}</strong>{" "}
              {lastTransaction.type === "borrow"
                ? `borrowed by ${lastTransaction.studentName}`
                : "returned successfully"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                Scan Barcode
              </CardTitle>
              <CardDescription>
                Scan a book barcode to check out or return
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  placeholder="Scan or enter barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  disabled={isScanning}
                  className="font-mono text-lg"
                />
                <Button onClick={handleScan} disabled={isScanning || !barcode.trim()}>
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Scan"
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Scan Result */}
              {scanResult && (
                <div className="space-y-4">
                  {/* Operation Mode Badge */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={mode === "borrow" ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {mode === "borrow" ? "Checkout Mode" : "Return Mode"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForNextScan}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>

                  {/* Book Info */}
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-10 rounded bg-muted flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{scanResult.book_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {scanResult.book_author}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Copy #{scanResult.copy_number}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getConditionColor(scanResult.condition)}
                      >
                        {scanResult.condition}
                      </Badge>
                    </div>
                  </div>

                  {/* Current Borrower (for returns) */}
                  {mode === "return" && scanResult.current_borrower && (
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {scanResult.current_borrower.student_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {formatDate(scanResult.current_borrower.due_date)}
                            {daysOverdue > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {daysOverdue} days overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Card - Changes based on mode */}
          {scanResult && mode !== "idle" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {mode === "borrow" ? "Checkout" : "Return"}
                </CardTitle>
                <CardDescription>
                  {mode === "borrow"
                    ? "Select a student to borrow this book"
                    : "Assess condition and complete return"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === "borrow" && (
                  <>
                    {/* Student Search */}
                    {!selectedStudent ? (
                      <div className="relative" ref={studentSearchRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search student..."
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
                            className="pl-10 pr-10"
                          />
                          {isSearchingStudent && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                          )}
                        </div>

                        {showStudentDropdown && studentResults.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-[240px] overflow-auto">
                            {studentResults.map((student) => (
                              <button
                                key={student.id}
                                className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                onClick={() => {
                                  if (
                                    student.status === "active" &&
                                    student.current_books < student.max_books &&
                                    student.unpaid_fines === 0
                                  ) {
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
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.student_id}
                                  </p>
                                </div>
                                <div className="flex gap-1">
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
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{selectedStudent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudent.student_id}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(null);
                            setStudentSearch("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleBorrow}
                      disabled={isSubmitting || !selectedStudent}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Checkout"
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
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any damage or issues..."
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        rows={2}
                      />
                    </div>

                    {daysOverdue > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Fine: <strong>${estimatedFine.toFixed(2)}</strong> ({daysOverdue}{" "}
                          days overdue)
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleReturn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Return"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
