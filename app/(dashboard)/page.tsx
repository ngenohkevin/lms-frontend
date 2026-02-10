"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import {
  useDashboardMetrics,
  usePopularBooks,
  useBorrowingTrends,
  useInventoryReport,
  useOverdueReport,
} from "@/lib/hooks/use-reports";
import { DashboardMetricsCards } from "@/components/reports/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookPlus,
  UserPlus,
  ArrowLeftRight,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { formatDate, formatNumber } from "@/lib/utils/format";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const trendsChartConfig = {
  borrowed: {
    label: "Borrowed",
    color: "hsl(var(--chart-1))",
  },
  returned: {
    label: "Returned",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const inventoryChartConfig = {
  available: {
    label: "Available Copies",
    color: "hsl(142, 71%, 45%)",
  },
  checked_out: {
    label: "Checked Out",
    color: "hsl(38, 92%, 50%)",
  },
  lost: {
    label: "Lost Copies",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  total_books: {
    label: "Titles",
    color: "hsl(221, 83%, 53%)",
  },
  total_borrowed: {
    label: "Borrowed",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

const INVENTORY_COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const RANK_STYLES = [
  "bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30",
  "bg-slate-300/20 text-slate-600 dark:text-slate-400 border border-slate-400/30",
  "bg-orange-400/20 text-orange-600 dark:text-orange-400 border border-orange-400/30",
];

const OVERDUE_COLORS: Record<string, string> = {
  "1-7 days": "text-amber-600 dark:text-amber-400",
  "8-14 days": "text-orange-600 dark:text-orange-400",
  "15-30 days": "text-red-500 dark:text-red-400",
  "31+ days": "text-red-700 dark:text-red-300",
};

export default function DashboardPage() {
  const { user, isLibrarian } = useAuth();
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { books: popularBooks, isLoading: booksLoading } = usePopularBooks({ limit: 5 });
  const { trends, isLoading: trendsLoading } = useBorrowingTrends();
  const { report: inventory, isLoading: inventoryLoading } = useInventoryReport();
  const { report: overdueReport, isLoading: overdueLoading } = useOverdueReport();

  const inventoryPieData = inventory
    ? [
        { name: "Available", value: inventory.available_copies },
        { name: "Checked Out", value: inventory.checked_out },
        { name: "Lost", value: inventory.lost_books },
      ]
    : [];

  const utilization = inventory && inventory.total_copies > 0
    ? Math.round((inventory.checked_out / inventory.total_copies) * 100)
    : 0;

  const topCategories = [...(inventory?.categories || [])]
    .sort((a, b) => b.total_books - a.total_books)
    .slice(0, 8);

  const maxBorrows = popularBooks.length > 0
    ? Math.max(...popularBooks.map((b) => b.borrow_count))
    : 1;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.username?.split("@")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in the library today.
          </p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href="/books/new">
                <BookPlus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 sm:flex-initial">
              <Link href="/students/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <DashboardMetricsCards
        metrics={metrics}
        isLoading={metricsLoading}
        showLibrarianMetrics={isLibrarian}
      />

      {/* Primary Charts Row */}
      {isLibrarian && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Borrowing Trends - AreaChart */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Borrowing Trends</CardTitle>
                <CardDescription>
                  Borrowing and returns over the past 30 days
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : trends && trends.length > 0 ? (
                <ChartContainer config={trendsChartConfig} className="h-[300px] w-full">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="fillBorrowed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-borrowed)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-borrowed)" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="fillReturned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-returned)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-returned)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => formatDate(value, "MMM d")}
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => formatDate(value, "EEEE, MMM d, yyyy")}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="borrowed"
                      stroke="var(--color-borrowed)"
                      strokeWidth={2}
                      fill="url(#fillBorrowed)"
                    />
                    <Area
                      type="monotone"
                      dataKey="returned"
                      stroke="var(--color-returned)"
                      strokeWidth={2}
                      fill="url(#fillReturned)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Status - Donut + Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>
                  Physical copies across the library
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : inventory ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ChartContainer config={inventoryChartConfig} className="h-[200px] w-[200px] shrink-0">
                    <PieChart>
                      <Pie
                        data={inventoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {inventoryPieData.map((_, index) => (
                          <Cell key={index} fill={INVENTORY_COLORS[index]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-semibold">{utilization}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Available Copies</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(inventory.available_copies)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Checked Out</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {formatNumber(inventory.checked_out)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Total Copies</p>
                        <p className="text-xl font-bold">
                          {formatNumber(inventory.total_copies)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Lost Copies</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          {formatNumber(inventory.lost_books)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No inventory data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution - Horizontal BarChart */}
        {isLibrarian && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Top categories by title count</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {inventoryLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : topCategories.length > 0 ? (
                <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                  <BarChart
                    data={topCategories}
                    layout="vertical"
                    margin={{ left: -10, right: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                      tickFormatter={(value: string) =>
                        value.length > 12 ? value.slice(0, 12) + "…" : value
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="total_books"
                      fill="var(--color-total_books)"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="total_borrowed"
                      fill="var(--color-total_borrowed)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Popular Books - Enhanced List */}
        <Card className={!isLibrarian ? "lg:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <CardTitle className="truncate">Popular Books</CardTitle>
                <CardDescription className="truncate">Most borrowed books this month</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/books">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-12 w-9 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : popularBooks && popularBooks.length > 0 ? (
              <div className="space-y-3">
                {popularBooks.map((book, index) => (
                  <Link
                    key={book.book_id}
                    href={`/books/${book.book_id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index < 3 ? RANK_STYLES[index] : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <BookCoverImage src={book.cover_url} alt={book.title} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {book.author}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${(book.borrow_count / maxBorrows) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {book.average_rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {book.average_rating.toFixed(1)}
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {book.borrow_count}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No popular books data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Breakdown */}
      {isLibrarian && overdueReport && overdueReport.overdue_by_days && overdueReport.overdue_by_days.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Overdue Breakdown</CardTitle>
                <CardDescription>
                  {formatNumber(overdueReport.total_overdue)} total overdue books by duration
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">
                Full Report <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overdueLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {overdueReport.overdue_by_days.map((item) => (
                  <div
                    key={item.range}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <p className="text-sm text-muted-foreground">{item.range}</p>
                    <p className={`text-3xl font-bold mt-1 ${OVERDUE_COLORS[item.range] || "text-foreground"}`}>
                      {formatNumber(item.count)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">books overdue</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <Link href="/transactions/borrow" className="block p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Borrow Book</h3>
                  <p className="text-sm text-muted-foreground">
                    Check out a book
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <Link href="/transactions" className="block p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-xl bg-emerald-500/10 p-3 group-hover:bg-emerald-500/15 transition-colors">
                  <ArrowLeftRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Return Book</h3>
                  <p className="text-sm text-muted-foreground">
                    Process a return
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <Link href="/reservations" className="block p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3 group-hover:bg-blue-500/15 transition-colors">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Reservations</h3>
                  <p className="text-sm text-muted-foreground">
                    View reservations
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <Link href="/books" className="block p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-xl bg-violet-500/10 p-3 group-hover:bg-violet-500/15 transition-colors">
                  <BookPlus className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Browse Books</h3>
                  <p className="text-sm text-muted-foreground">
                    Search the catalog
                  </p>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
