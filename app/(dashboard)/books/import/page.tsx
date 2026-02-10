"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useSWRConfig } from "swr";
import { AuthGuard } from "@/components/auth/auth-guard";
import { booksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { BookImportResult } from "@/lib/types";

export default function BookImportPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BookImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();

      if (!["csv", "xlsx", "xls"].includes(ext || "")) {
        setError("Only CSV and Excel files (.csv, .xlsx, .xls) are supported");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const importResult = await booksApi.import(file);
      setResult(importResult);

      if (importResult.success_count > 0) {
        // Invalidate all books-related SWR cache
        await mutate(
          (key) =>
            typeof key === "string"
              ? key.includes("/api/v1/books")
              : Array.isArray(key) && key[0]?.includes("/api/v1/books"),
          undefined,
          { revalidate: false }
        );
        toast.success(`Successfully imported ${importResult.success_count} books`);
      }
      if (importResult.failure_count > 0) {
        toast.warning(`${importResult.failure_count} books failed to import`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import books";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const downloadTemplate = () => {
    const headers = [
      "isbn",
      "book_type",
      "category",
      "title",
      "author",
      "publisher",
      "published_year",
      "genre",
      "description",
      "shelf_location",
    ];
    const sampleData = [
      "978-0743273565,storybook,Fiction,The Great Gatsby,F. Scott Fitzgerald,Scribner,1925,Fiction,,A-1",
      "978-0451524935,storybook,Fiction,,,,,,",
    ];

    const csvContent = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "book_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            className="-ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-3xl font-bold tracking-tight mt-2">Import Books</h1>
          <p className="text-muted-foreground">
            Bulk import books from CSV or Excel files
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Select a CSV or Excel file containing book data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result && (
                <>
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      transition-colors
                      ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                      ${file ? "border-primary bg-primary/5" : ""}
                    `}
                  >
                    <input {...getInputProps()} />
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-primary">Drop the file here...</p>
                    ) : file ? (
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">
                          Drag & drop a file here, or click to select
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports CSV, XLSX, XLS (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={!file || isUploading}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Books
                        </>
                      )}
                    </Button>
                    {file && (
                      <Button variant="outline" onClick={handleReset}>
                        Clear
                      </Button>
                    )}
                  </div>
                </>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Success Summary */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    {result.failure_count === 0 ? (
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    ) : result.success_count === 0 ? (
                      <XCircle className="h-10 w-10 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-10 w-10 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">Import Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {result.success_count} of {result.total_records} books imported
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success: {result.success_count}</span>
                      <span>Failed: {result.failure_count}</span>
                    </div>
                    <Progress
                      value={(result.success_count / result.total_records) * 100}
                    />
                  </div>

                  {/* Summary Stats */}
                  {result.summary && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">New Books</p>
                        <p className="font-semibold text-lg">{result.summary.new_books}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Duplicates</p>
                        <p className="font-semibold text-lg">{result.summary.duplicates_found}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleReset} className="flex-1">
                      Import Another File
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/books">View Books</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                How to prepare your import file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Required Columns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">isbn</Badge>
                  <Badge variant="secondary">book_type</Badge>
                  <Badge variant="secondary">category</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Optional Columns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">title</Badge>
                  <Badge variant="outline">author</Badge>
                  <Badge variant="outline">publisher</Badge>
                  <Badge variant="outline">published_year</Badge>
                  <Badge variant="outline">genre</Badge>
                  <Badge variant="outline">description</Badge>
                  <Badge variant="outline">shelf_location</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>First row must contain column headers</li>
                  <li>The system will automatically look up book details from the ISBN</li>
                  <li>Values you provide in CSV take priority over ISBN lookup</li>
                  <li>book_type must be &quot;textbook&quot; or &quot;storybook&quot;</li>
                  <li>category must match an existing category name</li>
                  <li>Duplicate ISBNs will be skipped</li>
                  <li>Maximum file size is 10MB</li>
                </ul>
              </div>

              {/* Example CSV Preview */}
              <div className="space-y-2">
                <h4 className="font-medium">Example CSV</h4>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">isbn</TableHead>
                        <TableHead className="text-xs">book_type</TableHead>
                        <TableHead className="text-xs">category</TableHead>
                        <TableHead className="text-xs">title</TableHead>
                        <TableHead className="text-xs">author</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs font-mono">978-0743273565</TableCell>
                        <TableCell className="text-xs">storybook</TableCell>
                        <TableCell className="text-xs">Fiction</TableCell>
                        <TableCell className="text-xs">The Great Gatsby</TableCell>
                        <TableCell className="text-xs">F. Scott Fitzgerald</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">978-0451524935</TableCell>
                        <TableCell className="text-xs">storybook</TableCell>
                        <TableCell className="text-xs">Fiction</TableCell>
                        <TableCell className="text-xs text-muted-foreground italic">auto-filled</TableCell>
                        <TableCell className="text-xs text-muted-foreground italic">auto-filled</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Errors Table */}
        {result && result.errors && result.errors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Import Errors ({result.errors.length})
              </CardTitle>
              <CardDescription>
                The following rows could not be imported
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-32">ISBN</TableHead>
                    <TableHead className="w-32">Field</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.slice(0, 50).map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {err.isbn || "-"}
                      </TableCell>
                      <TableCell>{err.field || "-"}</TableCell>
                      <TableCell className="text-destructive">
                        {err.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {result.errors.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing first 50 errors of {result.errors.length} total
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
