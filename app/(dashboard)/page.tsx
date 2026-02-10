"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useDashboardMetrics, usePopularBooks, useBorrowingTrends } from "@/lib/hooks/use-reports";
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
} from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/utils/format";

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

export default function DashboardPage() {
  const { user, isLibrarian } = useAuth();
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { books: popularBooks, isLoading: booksLoading } = usePopularBooks({ limit: 5 });
  const { trends, isLoading: trendsLoading } = useBorrowingTrends();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username?.split("@")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in the library today.
          </p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/books/new">
                <BookPlus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
            <Button variant="outline" asChild>
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

      {/* Charts and Tables Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Borrowing Trends Chart */}
        {isLibrarian && (
          <Card>
            <CardHeader>
              <CardTitle>Borrowing Trends</CardTitle>
              <CardDescription>
                Book borrowing and returns over the past 30 days
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
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Popular Books */}
        <Card className={!isLibrarian ? "lg:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Popular Books</CardTitle>
              <CardDescription>Most borrowed books this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
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
              <div className="space-y-4">
                {popularBooks.map((book, index) => (
                  <Link
                    key={book.book_id}
                    href={`/books/${book.book_id}`}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="relative">
                      <BookCoverImage src={book.cover_url} alt={book.title} />
                      <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{book.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {book.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {book.average_rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {book.average_rating.toFixed(1)}
                        </div>
                      )}
                      <Badge variant="secondary">
                        {book.borrow_count} borrows
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
