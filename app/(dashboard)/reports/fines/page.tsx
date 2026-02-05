"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Users, TrendingUp, AlertCircle, Percent, Building, GraduationCap, Receipt, DollarSign } from "lucide-react";
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
import { useFinesCollectionReport } from "@/lib/hooks/use-reports";
import type { FinesCollectionReportRequest } from "@/lib/types";

export default function FinesCollectionReportPage() {
  const router = useRouter();
  const [params, setParams] = useState<FinesCollectionReportRequest>({
    interval: "month",
    limit: 50,
  });

  const { report, isLoading, error, refresh } = useFinesCollectionReport(params);

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
        <h2 className="text-xl font-semibold">Failed to load fines collection report</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <PrintableReport
      title="Fines Collection Report"
      subtitle="Outstanding fines and collection metrics"
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
          title="Fines Collection Report"
          description="Track fine generation, collection rates, and outstanding balances"
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
                  title="Total Fines Generated"
                  value={`KSH ${report.summary.total_fines_generated}`}
                  icon={<DollarSign className="h-4 w-4" />}
                  subtitle={`${report.summary.total_fine_records} records`}
                />
                <SummaryCard
                  title="Total Collected"
                  value={`KSH ${report.summary.total_collected}`}
                  icon={<DollarSign className="h-4 w-4" />}
                  valueClassName="text-green-600"
                />
                <SummaryCard
                  title="Outstanding"
                  value={`KSH ${report.summary.total_outstanding}`}
                  icon={<AlertCircle className="h-4 w-4" />}
                  subtitle={`${report.summary.students_with_outstanding} students`}
                  valueClassName={parseFloat(report.summary.total_outstanding) > 0 ? "text-destructive" : ""}
                />
                <SummaryCard
                  title="Collection Rate"
                  value={`${report.summary.collection_rate}%`}
                  icon={<Percent className="h-4 w-4" />}
                  subtitle={`Avg fine: KSH ${report.summary.average_fine}`}
                />
              </SummaryGrid>
            </PrintSection>

            {/* Additional Stats Row */}
            <SummaryGrid columns={2}>
              <SummaryCard
                title="Total Waived"
                value={`KSH ${report.summary.total_waived}`}
                icon={<Receipt className="h-4 w-4" />}
                subtitle="Fines waived by librarians"
              />
              <SummaryCard
                title="Average Fine Amount"
                value={`KSH ${report.summary.average_fine}`}
                icon={<DollarSign className="h-4 w-4" />}
              />
            </SummaryGrid>

            {/* Fines by Year of Study */}
            {report.by_year_of_study && report.by_year_of_study.length > 0 && (
              <PrintSection title="Fines by Year of Study">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Breakdown by Academic Year
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead className="text-right">Fine Count</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                          <TableHead className="text-right">Total Fines</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.by_year_of_study.map((year, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">Year {year.year_of_study}</TableCell>
                            <TableCell className="text-right">{year.fine_count}</TableCell>
                            <TableCell className="text-right">{year.students_affected}</TableCell>
                            <TableCell className="text-right">KSH {year.total_fines}</TableCell>
                            <TableCell className="text-right text-green-600">KSH {year.paid_amount}</TableCell>
                            <TableCell className="text-right text-destructive">KSH {year.outstanding_amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Fines by Year of Study */}
            {report.by_year_of_study && report.by_year_of_study.length > 0 && (
              <PrintSection title="Fines by Year of Study">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Breakdown by Year of Study
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year of Study</TableHead>
                          <TableHead className="text-right">Fine Count</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                          <TableHead className="text-right">Total Fines</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.by_year_of_study.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">Year {item.year_of_study}</TableCell>
                            <TableCell className="text-right">{item.fine_count}</TableCell>
                            <TableCell className="text-right">{item.students_affected}</TableCell>
                            <TableCell className="text-right">KSH {item.total_fines}</TableCell>
                            <TableCell className="text-right text-green-600">KSH {item.paid_amount}</TableCell>
                            <TableCell className="text-right text-destructive">KSH {item.outstanding_amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Collection Trends */}
            {report.trends && report.trends.length > 0 && (
              <PrintSection title="Collection Trends">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Fines Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">Fine Count</TableHead>
                          <TableHead className="text-right">Generated</TableHead>
                          <TableHead className="text-right">Collected</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.trends.map((trend, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{trend.period}</TableCell>
                            <TableCell className="text-right">{trend.fine_count}</TableCell>
                            <TableCell className="text-right">KSH {trend.generated}</TableCell>
                            <TableCell className="text-right text-green-600">KSH {trend.collected}</TableCell>
                            <TableCell className="text-right text-destructive">KSH {trend.outstanding}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Top Defaulters */}
            {report.top_defaulters && report.top_defaulters.length > 0 && (
              <PrintSection title="Top Fine Defaulters" pageBreakBefore>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Students with Highest Outstanding Fines
                    </CardTitle>
                    <CardDescription>
                      Top {report.top_defaulters.length} students by outstanding fine amount
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead className="text-right">Fines</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.top_defaulters.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{student.student_name}</p>
                                <p className="text-sm text-muted-foreground">{student.student_code}</p>
                                {student.email && (
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>Year {student.year_of_study}</TableCell>
                            <TableCell className="text-right">{student.fine_count}</TableCell>
                            <TableCell className="text-right">KSH {student.total_fines}</TableCell>
                            <TableCell className="text-right font-medium text-destructive">
                              KSH {student.outstanding_fines}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Recent Fine History */}
            {report.recent_fines && report.recent_fines.length > 0 && (
              <PrintSection title="Recent Fine History">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Fine Transactions</CardTitle>
                    <CardDescription>
                      Showing {report.recent_fines.length} most recent fine records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Book</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Days Overdue</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.recent_fines.map((fine) => (
                          <TableRow key={fine.transaction_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{fine.student_name}</p>
                                <p className="text-sm text-muted-foreground">{fine.student_code}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{fine.book_title}</p>
                                <p className="text-xs text-muted-foreground">{fine.book_code}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {fine.due_date
                                ? format(new Date(fine.due_date), "MMM d, yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">{fine.days_overdue}</TableCell>
                            <TableCell className="text-right font-medium">KSH {fine.fine_amount}</TableCell>
                            <TableCell>
                              {fine.fine_waived ? (
                                <Badge variant="secondary">Waived</Badge>
                              ) : fine.fine_paid ? (
                                <Badge variant="default">Paid</Badge>
                              ) : (
                                <Badge variant="destructive">Unpaid</Badge>
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
