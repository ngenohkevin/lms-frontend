"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, User, BookOpen, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReportHeader,
  SummaryCard,
  SummaryGrid,
  PrintableReport,
  PrintSection,
  ChartPrintFallback,
} from "@/components/reports";
import { useIndividualStudentReport } from "@/lib/hooks/use-reports";
import { formatKsh } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const studentId = parseInt(id, 10);
  const { report, isLoading, error, refresh } = useIndividualStudentReport(studentId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Failed to load student report</h2>
        <p className="text-muted-foreground">
          {error?.message || "Student not found or report unavailable"}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { profile, transaction_stats, fines_summary, reading_stats, monthly_activity, recent_history } = report;
  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <PrintableReport
      title={`Student Report: ${fullName}`}
      subtitle={`Student ID: ${profile.student_id} | Year ${profile.year_of_study}`}
    >
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="no-print">
          <Button variant="ghost" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <ReportHeader
          title={`Student Report: ${fullName}`}
          description={`Comprehensive library activity report for ${profile.student_id}`}
          onRefresh={refresh}
          isLoading={isLoading}
        />

        {/* Student Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{profile.student_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year of Study</p>
                <p className="font-medium">Year {profile.year_of_study}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {profile.member_since
                    ? format(new Date(profile.member_since), "MMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <PrintSection title="Summary Statistics">
          <SummaryGrid columns={4}>
            <SummaryCard
              title="Total Books Borrowed"
              value={transaction_stats.total_books_borrowed}
              icon={<BookOpen className="h-4 w-4" />}
              subtitle="All time"
            />
            <SummaryCard
              title="Currently Borrowed"
              value={transaction_stats.currently_borrowed}
              icon={<BookOpen className="h-4 w-4" />}
              subtitle={`Max: ${profile.max_books}`}
            />
            <SummaryCard
              title="Overdue Books"
              value={transaction_stats.overdue_count}
              icon={<AlertCircle className="h-4 w-4" />}
              valueClassName={transaction_stats.overdue_count > 0 ? "text-destructive" : ""}
            />
            <SummaryCard
              title="Outstanding Fines"
              value={formatKsh(fines_summary.outstanding_fines)}
              icon={<DollarSign className="h-4 w-4" />}
              subtitle={`Paid: ${formatKsh(fines_summary.total_fines_paid)}`}
              valueClassName={parseFloat(fines_summary.outstanding_fines) > 0 ? "text-destructive" : ""}
            />
          </SummaryGrid>
        </PrintSection>

        {/* Reading Stats by Genre */}
        {reading_stats && reading_stats.length > 0 && (
          <PrintSection title="Reading Preferences by Genre">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Genre</TableHead>
                      <TableHead className="text-right">Books Read</TableHead>
                      <TableHead className="text-right">Avg. Days Held</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reading_stats.map((stat, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{stat.genre || "Unknown"}</TableCell>
                        <TableCell className="text-right">{stat.books_read}</TableCell>
                        <TableCell className="text-right">{stat.avg_days_held}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </PrintSection>
        )}

        {/* Monthly Activity */}
        {monthly_activity && monthly_activity.length > 0 && (
          <PrintSection title="Monthly Activity">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Borrowed</TableHead>
                      <TableHead className="text-right">Returned</TableHead>
                      <TableHead className="text-right">Fines Incurred</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthly_activity.map((activity, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{activity.month}</TableCell>
                        <TableCell className="text-right">{activity.borrowed}</TableCell>
                        <TableCell className="text-right">{activity.returned}</TableCell>
                        <TableCell className="text-right">{formatKsh(activity.fines_incurred)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ChartPrintFallback
                  data={monthly_activity.map((a) => ({
                    month: a.month,
                    borrowed: a.borrowed,
                    returned: a.returned,
                    fines: a.fines_incurred,
                  }))}
                  columns={[
                    { key: "month", label: "Month" },
                    { key: "borrowed", label: "Borrowed" },
                    { key: "returned", label: "Returned" },
                    { key: "fines", label: "Fines", format: (v) => formatKsh(v) },
                  ]}
                />
              </CardContent>
            </Card>
          </PrintSection>
        )}

        {/* Transaction History */}
        {recent_history && recent_history.length > 0 && (
          <PrintSection title="Recent Transaction History" pageBreakBefore>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  Showing {recent_history.length} most recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent_history.map((tx) => (
                      <TableRow key={tx.transaction_id}>
                        <TableCell>
                          {format(new Date(tx.transaction_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {tx.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.book_title}</p>
                            <p className="text-sm text-muted-foreground">{tx.book_author}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.due_date ? format(new Date(tx.due_date), "MMM d, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "returned"
                                ? "default"
                                : tx.status === "overdue"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(tx.fine_amount) > 0 ? (
                            <span className={tx.fine_paid ? "" : "text-destructive"}>
                              {formatKsh(tx.fine_amount)}
                              {tx.fine_paid && (
                                <span className="text-xs text-muted-foreground ml-1">(paid)</span>
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </PrintSection>
        )}
      </div>
    </PrintableReport>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  );
}
