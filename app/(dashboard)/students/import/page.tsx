"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useSWRConfig } from "swr";
import { AuthGuard } from "@/components/auth/auth-guard";
import { studentsApi } from "@/lib/api";
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
import type { StudentImportResult } from "@/lib/types";

export default function StudentImportPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<StudentImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();

      if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
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
      const importResult = await studentsApi.import(file);
      setResult(importResult);

      if (importResult.successful_count > 0) {
        await mutate(
          (key) =>
            typeof key === "string"
              ? key.includes("/api/v1/students")
              : Array.isArray(key) && key[0]?.includes("/api/v1/students"),
          undefined,
          { revalidate: false }
        );
        toast.success(
          `Successfully imported ${importResult.successful_count} students`
        );
      }
      if (importResult.failed_count > 0) {
        toast.warning(
          `${importResult.failed_count} students failed to import`
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to import students";
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
      "student_id",
      "first_name",
      "last_name",
      "year_of_study",
      "email",
      "phone",
      "max_books",
    ];
    const sampleData = [
      "STU2025001,John,Doe,1,john.doe@school.edu,+254700000001,5",
      "STU2025002,Jane,Smith,2,,,",
    ];

    const csvContent = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
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

          <h1 className="text-3xl font-bold tracking-tight mt-2">
            Import Students
          </h1>
          <p className="text-muted-foreground">
            Bulk import students from a CSV or Excel file
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
                Select a CSV or Excel file containing student data
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
                          Supports CSV and Excel files (max 10MB)
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
                          Import Students
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
                    {result.failed_count === 0 ? (
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    ) : result.successful_count === 0 ? (
                      <XCircle className="h-10 w-10 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-10 w-10 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">Import Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {result.successful_count} of {result.total_records}{" "}
                        students imported
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success: {result.successful_count}</span>
                      <span>Failed: {result.failed_count}</span>
                    </div>
                    <Progress
                      value={
                        result.total_records > 0
                          ? (result.successful_count / result.total_records) *
                            100
                          : 0
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleReset} className="flex-1">
                      Import Another File
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/students">View Students</Link>
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
                  <Badge variant="secondary">student_id</Badge>
                  <Badge variant="secondary">first_name</Badge>
                  <Badge variant="secondary">last_name</Badge>
                  <Badge variant="secondary">year_of_study</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Optional Columns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">email</Badge>
                  <Badge variant="outline">phone</Badge>
                  <Badge variant="outline">max_books</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  These fields can also be added later when editing each student
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>First row must contain column headers</li>
                  <li>student_id must be unique (e.g., STU2025001)</li>
                  <li>Duplicate student IDs will be skipped</li>
                  <li>year_of_study must be between 1 and 8</li>
                  <li>Max books allowed defaults to 5</li>
                  <li>Default password is the student ID</li>
                  <li>Maximum file size is 10MB</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>

              {/* CSV Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Example CSV</h4>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs whitespace-nowrap">student_id</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">first_name</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">last_name</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">year_of_study</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">email</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">phone</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">max_books</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs font-mono">STU2025001</TableCell>
                        <TableCell className="text-xs">John</TableCell>
                        <TableCell className="text-xs">Doe</TableCell>
                        <TableCell className="text-xs">1</TableCell>
                        <TableCell className="text-xs">john@school.edu</TableCell>
                        <TableCell className="text-xs">+254700000001</TableCell>
                        <TableCell className="text-xs">5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">STU2025002</TableCell>
                        <TableCell className="text-xs">Jane</TableCell>
                        <TableCell className="text-xs">Smith</TableCell>
                        <TableCell className="text-xs">2</TableCell>
                        <TableCell className="text-xs"></TableCell>
                        <TableCell className="text-xs"></TableCell>
                        <TableCell className="text-xs"></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-40">Data</TableHead>
                    <TableHead className="w-32">Field</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.slice(0, 50).map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {err.data || "-"}
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
