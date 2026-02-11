"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Users,
  BookOpen,
  AlertCircle,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/reports";
import {
  useStudentActivityReport,
  useStudentBehaviorAnalysis,
} from "@/lib/hooks/use-reports";
import type {
  StudentActivityReportRequest,
  StudentBehaviorAnalysisRequest,
} from "@/lib/types";

export default function StudentActivityReportPage() {
  const router = useRouter();
  const [activityParams, setActivityParams] =
    useState<StudentActivityReportRequest>({});
  const [behaviorParams, setBehaviorParams] =
    useState<StudentBehaviorAnalysisRequest>({});

  const {
    report: activityReport,
    isLoading: activityLoading,
    error: activityError,
    refresh: refreshActivity,
  } = useStudentActivityReport(activityParams);
  const {
    report: behaviorReport,
    isLoading: behaviorLoading,
  } = useStudentBehaviorAnalysis(behaviorParams);

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const dates = {
      start_date: range.from?.toISOString(),
      end_date: range.to?.toISOString(),
    };
    setActivityParams((prev) => ({ ...prev, ...dates }));
    setBehaviorParams((prev) => ({ ...prev, ...dates }));
  };

  if (activityError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">
          Failed to load student activity report
        </h2>
        <p className="text-muted-foreground">{activityError.message}</p>
      </div>
    );
  }

  return (
    <PrintableReport
      title="Student Activity Report"
      subtitle="Borrowing patterns and student engagement analysis"
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
          title="Student Activity Report"
          description="Most active students, borrowing patterns by year of study, and engagement metrics"
          onRefresh={refreshActivity}
          isLoading={activityLoading}
        >
          <DateRangeFilter
            from={
              activityParams.start_date
                ? new Date(activityParams.start_date)
                : undefined
            }
            to={
              activityParams.end_date
                ? new Date(activityParams.end_date)
                : undefined
            }
            onChange={handleDateChange}
          />
        </ReportHeader>

        {activityLoading ? (
          <LoadingSkeleton />
        ) : activityReport ? (
          <>
            {/* Summary */}
            <PrintSection title="Summary">
              <SummaryGrid columns={4}>
                <SummaryCard
                  title="Active Students"
                  value={activityReport.summary.active_students}
                  icon={<Users className="h-4 w-4" />}
                />
                <SummaryCard
                  title="Total Borrows"
                  value={activityReport.summary.total_borrows}
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <SummaryCard
                  title="Total Returns"
                  value={activityReport.summary.total_returns}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <SummaryCard
                  title="Currently Overdue"
                  value={activityReport.summary.total_overdue}
                  icon={<AlertCircle className="h-4 w-4" />}
                  valueClassName={
                    activityReport.summary.total_overdue > 0
                      ? "text-destructive"
                      : ""
                  }
                />
              </SummaryGrid>
            </PrintSection>

            {/* Most Active Students */}
            {activityReport.students && activityReport.students.length > 0 && (
              <PrintSection title="Most Active Students">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Top Students by Borrowing Activity
                    </CardTitle>
                    <CardDescription>
                      Showing {activityReport.students.length} most active
                      students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">
                              Borrows
                            </TableHead>
                            <TableHead className="text-right">
                              Returns
                            </TableHead>
                            <TableHead className="text-right">
                              Current
                            </TableHead>
                            <TableHead className="text-right">
                              Overdue
                            </TableHead>
                            <TableHead className="text-right">Fines</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Last Active
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activityReport.students.map((s) => (
                            <TableRow key={s.student_id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {s.student_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {s.student_id}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>Year {s.year_of_study}</TableCell>
                              <TableCell className="text-right">
                                {s.total_borrows}
                              </TableCell>
                              <TableCell className="text-right">
                                {s.total_returns}
                              </TableCell>
                              <TableCell className="text-right">
                                {s.current_books}
                              </TableCell>
                              <TableCell className="text-right">
                                {s.overdue_books > 0 ? (
                                  <Badge variant="destructive">
                                    {s.overdue_books}
                                  </Badge>
                                ) : (
                                  0
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                KSH {s.total_fines}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                {s.last_activity
                                  ? format(
                                      new Date(s.last_activity),
                                      "MMM d, yyyy"
                                    )
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </PrintSection>
            )}

            {/* Behavior Analysis by Year of Study */}
            {behaviorLoading ? (
              <Skeleton className="h-64" />
            ) : behaviorReport &&
              behaviorReport.behavior_data &&
              behaviorReport.behavior_data.length > 0 ? (
              <PrintSection title="Behavior Analysis by Year of Study">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Borrowing Patterns by Year
                    </CardTitle>
                    <CardDescription>
                      {behaviorReport.summary.total_analyzed_students} students
                      analyzed &middot; Most active: Year{" "}
                      {behaviorReport.summary.most_active_year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">
                              Students
                            </TableHead>
                            <TableHead className="text-right">
                              Avg Borrows
                            </TableHead>
                            <TableHead className="text-right">
                              Avg Loan Days
                            </TableHead>
                            <TableHead className="text-right">
                              Overdue Rate
                            </TableHead>
                            <TableHead className="text-right">
                              Heavy Users
                            </TableHead>
                            <TableHead className="text-right">
                              Light Users
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Top Genres
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {behaviorReport.behavior_data.map((row) => (
                            <TableRow key={row.year_of_study}>
                              <TableCell className="font-medium">
                                Year {row.year_of_study}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.total_students}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.avg_borrows_per_student}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.avg_loan_duration_days}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.avg_overdue_rate_percent}%
                              </TableCell>
                              <TableCell className="text-right">
                                {row.heavy_users}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.light_users}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                {row.popular_genres || "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </PrintSection>
            ) : null}
          </>
        ) : null}
      </div>
    </PrintableReport>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
