"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import {
  useDashboardMetrics,
  useBorrowingTrends,
  usePopularBooks,
  useCategoryStats,
  useInventoryReport,
  useOverdueReport,
} from "@/lib/hooks/use-reports";
import { DashboardMetricsCards } from "@/components/reports/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  BookOpen,
  Users,
  Library,
  Star,
} from "lucide-react";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils/format";

const chartConfig = {
  borrowed: {
    label: "Borrowed",
    color: "hsl(var(--chart-1))",
  },
  returned: {
    label: "Returned",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { trends, isLoading: trendsLoading } = useBorrowingTrends();
  const { books: popularBooks, isLoading: booksLoading } = usePopularBooks({ limit: 10 });
  const { stats: categoryStats, isLoading: categoryLoading } = useCategoryStats();
  const { report: inventory, isLoading: inventoryLoading } = useInventoryReport();
  const { report: overdueReport, isLoading: overdueLoading } = useOverdueReport();

  return (
    <AuthGuard requiredPermission={PermissionCodes.REPORTS_VIEW}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Analytics and insights for the library
            </p>
          </div>
          <PermissionGuard permission={PermissionCodes.REPORTS_EXPORT} hideWhenDenied>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </PermissionGuard>
        </div>

        {/* Summary Metrics */}
        <DashboardMetricsCards
          metrics={metrics}
          isLoading={metricsLoading}
          showLibrarianMetrics={true}
        />

        {/* Tabbed Reports */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Borrowing Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Borrowing Trends</CardTitle>
                  <CardDescription>
                    Book activity over the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : trends && trends.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <LineChart data={trends}>
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value, "MMM d")}
                          stroke="#888888"
                          fontSize={12}
                        />
                        <YAxis stroke="#888888" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="borrowed"
                          stroke="var(--color-borrowed)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="returned"
                          stroke="var(--color-returned)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Popular Books */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Books</CardTitle>
                  <CardDescription>Most borrowed this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {booksLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : popularBooks && popularBooks.length > 0 ? (
                    <div className="space-y-3">
                      {popularBooks.slice(0, 5).map((book, index) => (
                        <div
                          key={book.book_id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{book.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {book.author}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {book.borrow_count} borrows
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Books by category in the library
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : categoryStats && categoryStats.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {categoryStats.slice(0, 8).map((cat, index) => (
                      <div
                        key={cat.category}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{cat.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {cat.total_books} books
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrowing Tab */}
          <TabsContent value="borrowing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Borrowing Statistics</CardTitle>
                <CardDescription>Detailed borrowing analytics</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : trends && trends.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <BarChart data={trends}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => formatDate(value, "MMM d")}
                        stroke="#888888"
                        fontSize={12}
                      />
                      <YAxis stroke="#888888" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="borrowed" fill="var(--color-borrowed)" />
                      <Bar dataKey="returned" fill="var(--color-returned)" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No borrowing data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-4">
              {inventoryLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : inventory ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Titles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(inventory.total_books)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Copies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(inventory.total_copies)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Available
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(inventory.available_copies)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Checked Out
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(inventory.checked_out)}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* Category Breakdown */}
            {inventory && inventory.categories && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventory.categories.map((cat) => (
                      <div
                        key={cat.category}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{cat.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {cat.total_books} titles
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{cat.available} available</p>
                          <p className="text-sm text-muted-foreground">
                            {cat.total_borrowed} borrowed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Overdue Tab */}
          <TabsContent value="overdue" className="space-y-6 mt-6">
            {overdueLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : overdueReport ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Overdue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {formatNumber(overdueReport.total_overdue)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Fine Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {formatCurrency(overdueReport.total_fine_amount)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {overdueReport.overdue_by_department && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Overdue by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {overdueReport.overdue_by_department.map((dept) => (
                          <div
                            key={dept.department}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{dept.department}</p>
                              <p className="text-sm text-muted-foreground">
                                {dept.count} overdue items
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {formatCurrency(dept.fine_amount)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
                  No overdue data available
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
