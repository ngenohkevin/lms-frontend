"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { transactionsApi } from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  ScanLine,
  BookOpen,
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type { BarcodeScanResult, BookCondition } from "@/lib/types";

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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReturnPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Return form state
  const [returnCondition, setReturnCondition] = useState<BookCondition>("good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle barcode scan
  const handleScan = useCallback(async () => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const result = await transactionsApi.scanBarcode(barcode.trim());

      if (!result.is_borrowed) {
        setError("This copy is not currently borrowed. Cannot process return.");
        setScanResult(null);
      } else {
        setScanResult(result);
        // Pre-fill condition with current condition
        if (result.condition) {
          setReturnCondition(result.condition as BookCondition);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan barcode");
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  }, [barcode]);

  // Handle return submission
  const handleReturn = async () => {
    if (!scanResult || !scanResult.current_borrower) {
      setError("No active transaction found for this copy");
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

      setSuccess(true);
      toast.success("Book returned successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process return");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset for new return
  const handleNewReturn = () => {
    setBarcode("");
    setScanResult(null);
    setError(null);
    setSuccess(false);
    setReturnCondition("good");
    setConditionNotes("");
    barcodeInputRef.current?.focus();
  };

  // Calculate fine preview
  const daysOverdue = scanResult?.current_borrower
    ? calculateDaysOverdue(scanResult.current_borrower.due_date)
    : 0;
  const estimatedFine = daysOverdue * 0.5; // $0.50 per day

  if (success) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Return Complete!</h2>
          <p className="text-muted-foreground mb-2">
            <strong>{scanResult?.book_title}</strong> has been returned.
          </p>
          {daysOverdue > 0 && (
            <p className="text-amber-600 dark:text-amber-400 mb-4">
              Fine of ${estimatedFine.toFixed(2)} has been recorded ({daysOverdue} days overdue).
            </p>
          )}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleNewReturn}>
              Return Another Book
            </Button>
            <Button asChild>
              <Link href="/transactions">View All Transactions</Link>
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
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
          <h1 className="text-3xl font-bold tracking-tight">Return Book</h1>
          <p className="text-muted-foreground">
            Scan the book barcode to process a return
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                Scan Barcode
              </CardTitle>
              <CardDescription>
                Enter or scan the book copy barcode
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
                  className="font-mono"
                />
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !barcode.trim()}
                >
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

              {scanResult && scanResult.is_borrowed && scanResult.current_borrower && (
                <div className="space-y-4 mt-4">
                  {/* Book Info */}
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-12 rounded bg-muted flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{scanResult.book_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {scanResult.book_author}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          Copy #{scanResult.copy_number} • {scanResult.barcode}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-2 ${getConditionColor(scanResult.condition)}`}
                        >
                          Condition: {scanResult.condition}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Borrower Info */}
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {scanResult.current_borrower.student_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {scanResult.current_borrower.student_code}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Due: {formatDate(scanResult.current_borrower.due_date)}
                          </span>
                          {daysOverdue > 0 && (
                            <Badge variant="destructive">
                              {daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overdue Warning */}
                  {daysOverdue > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This book is {daysOverdue} days overdue. A fine of{" "}
                        <strong>${estimatedFine.toFixed(2)}</strong> will be applied
                        ($0.50/day).
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Condition Assessment - Only show when scan result exists */}
          {scanResult && scanResult.is_borrowed && (
            <Card>
              <CardHeader>
                <CardTitle>Condition Assessment</CardTitle>
                <CardDescription>
                  Assess the condition of the returned book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Return Condition</Label>
                  <Select
                    value={returnCondition}
                    onValueChange={(value) =>
                      setReturnCondition(value as BookCondition)
                    }
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{condition.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {condition.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Condition Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe any damage or issues..."
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                  <h4 className="font-medium">Return Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Condition:</span>
                    <Badge
                      variant="outline"
                      className={getConditionColor(returnCondition)}
                    >
                      {returnCondition}
                    </Badge>
                    {daysOverdue > 0 && (
                      <>
                        <span className="text-muted-foreground">Days Overdue:</span>
                        <span className="text-destructive font-medium">
                          {daysOverdue}
                        </span>
                        <span className="text-muted-foreground">Fine:</span>
                        <span className="text-destructive font-medium">
                          ${estimatedFine.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleReturn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Return...
                    </>
                  ) : (
                    "Complete Return"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
