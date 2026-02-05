"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, BookX, Users, TrendingDown, AlertCircle, DollarSign } from "lucide-react";
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
  DateRangeFilter,
  IntervalSelect,
} from "@/components/reports";
import { useLostBooksReport } from "@/lib/hooks/use-reports";
import type { LostBooksReportRequest } from "@/lib/types";

export default function LostBooksReportPage() {
  const router = useRouter();
  const [params, setParams] = useState<LostBooksReportRequest>({
    interval: "month",
  });

  const { report, isLoading, error, refresh } = useLostBooksReport(params);

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    setParams((prev) => ({
      ...prev,
      start_date: range.from?.toISOString(),
      end_date: range.to?.toISOString(),
    }));
  };

  const handleIntervalChange = (interval: string) => {
    setParams((prev) => ({ ...prev, interval }));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Failed to load lost books report</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <PrintableReport
      title="Lost Books Report"
      subtitle="Analysis of lost library inventory and financial impact"
    >
      <div className="space-y-6">
        {/* Back button */}
        <div className="no-print">
          <Button variant="ghost" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <ReportHeader
          title="Lost Books Report"
          description="Track lost books, replacement costs, and recovery status"
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <DateRangeFilter
            from={params.start_date ? new Date(params.start_date) : undefined}
            to={params.end_date ? new Date(params.end_date) : undefined}
            onChange={handleDateChange}
          />
          <IntervalSelect
            value={params.interval || "month"}
            onChange={handleIntervalChange}
          />
        </ReportHeader>

        {isLoading ? (
          <LoadingSkeleton />
        ) : report ? (
          <>
            {/* Summary Statistics */}
            <PrintSection title="Summary">
              <SummaryGrid columns={4}>
                <SummaryCard
                  title="Total Lost Books"
                  value={report.summary.total_lost}
                  icon={<BookX className="h-4 w-4" />}
                  valueClassName="text-destructive"
                />
                <SummaryCard
                  title="Total Replacement Value"
                  value={`KSH ${report.summary.total_replacement_value}`}
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <SummaryCard
                  title="Outstanding Amount"
                  value={`KSH ${report.summary.total_outstanding}`}
                  icon={<DollarSign className="h-4 w-4" />}
                  subtitle={`Paid: KSH ${report.summary.total_paid}`}
                  valueClassName={parseFloat(report.summary.total_outstanding) > 0 ? "text-destructive" : ""}
                />
                <SummaryCard
                  title="Pending Payments"
                  value={report.summary.pending_payment_count}
                  icon={<Users className="h-4 w-4" />}
                  subtitle={`Recovered: ${report.summary.recovered_count}`}
                />
              </SummaryGrid>
            </PrintSection>

            {/* Lost Books by Category */}
            {report.by_category && report.by_category.length > 0 && (
              <PrintSection title="Lost Books by Category">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Genre/Category</TableHead>
                          <TableHead className="text-right">Books Lost</TableHead>
                          <TableHead className="text-right">Replacement Value</TableHead>
                          <TableHead className="text-right">Avg. Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.by_category.map((cat, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{cat.genre || "Unknown"}</TableCell>
                            <TableCell className="text-right">{cat.lost_count}</TableCell>
                            <TableCell className="text-right">KSH {cat.replacement_value}</TableCell>
                            <TableCell className="text-right">KSH {cat.avg_replacement_cost}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Lost Books by Year of Study */}
            {report.by_year_of_study && report.by_year_of_study.length > 0 && (
              <PrintSection title="Lost Books by Year of Study">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year of Study</TableHead>
                          <TableHead className="text-right">Books Lost</TableHead>
                          <TableHead className="text-right">Replacement Value</TableHead>
                          <TableHead className="text-right">Students Affected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.by_year_of_study.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">Year {item.year_of_study}</TableCell>
                            <TableCell className="text-right">{item.lost_count}</TableCell>
                            <TableCell className="text-right">KSH {item.replacement_value}</TableCell>
                            <TableCell className="text-right">{item.students_affected}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Trends */}
            {report.trends && report.trends.length > 0 && (
              <PrintSection title="Loss Trends">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Lost Books Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">Books Lost</TableHead>
                          <TableHead className="text-right">Replacement Value</TableHead>
                          <TableHead className="text-right">Recovered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.trends.map((trend, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{trend.period}</TableCell>
                            <TableCell className="text-right">{trend.lost_count}</TableCell>
                            <TableCell className="text-right">KSH {trend.replacement_value}</TableCell>
                            <TableCell className="text-right">{trend.recovered}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Detailed Lost Books List */}
            {report.lost_books && report.lost_books.length > 0 && (
              <PrintSection title="Lost Books Details" pageBreakBefore>
                <Card>
                  <CardHeader>
                    <CardTitle>Lost Books List</CardTitle>
                    <CardDescription>
                      Showing {report.lost_books.length} lost book records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Lost Date</TableHead>
                          <TableHead className="text-right">Replacement</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.lost_books.map((book) => (
                          <TableRow key={book.transaction_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{book.book_title}</p>
                                <p className="text-sm text-muted-foreground">{book.book_author}</p>
                                <p className="text-xs text-muted-foreground">{book.book_code}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{book.student_name}</p>
                                <p className="text-sm text-muted-foreground">{book.student_code}</p>
                                <p className="text-xs text-muted-foreground">Year {book.year_of_study}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {book.lost_date
                                ? format(new Date(book.lost_date), "MMM d, yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${book.replacement_cost}
                            </TableCell>
                            <TableCell>
                              <Badge variant={book.fine_paid ? "default" : "destructive"}>
                                {book.fine_paid ? "Paid" : "Unpaid"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}
          </>
        ) : null}
      </div>
    </PrintableReport>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  );
}
