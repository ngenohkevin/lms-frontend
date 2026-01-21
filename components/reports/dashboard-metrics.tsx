"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Library,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  BookOpen,
  BookMarked,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils/format";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={`flex items-center text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 mr-1 ${!trend.isPositive && "rotate-180"}`}
            />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsCardsProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
  showLibrarianMetrics?: boolean;
}

export function DashboardMetricsCards({
  metrics,
  isLoading,
  showLibrarianMetrics = false,
}: DashboardMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: showLibrarianMetrics ? 8 : 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Books"
        value={formatNumber(metrics.total_books)}
        description="Books in the library"
        icon={Library}
      />
      <MetricCard
        title="Active Transactions"
        value={formatNumber(metrics.active_borrows)}
        description="Currently borrowed"
        icon={ArrowLeftRight}
      />
      <MetricCard
        title="Overdue"
        value={formatNumber(metrics.overdue_books)}
        description="Books past due date"
        icon={AlertTriangle}
        className={
          metrics.overdue_books > 0
            ? "border-destructive/50 bg-destructive/5"
            : undefined
        }
      />
      <MetricCard
        title="Pending Reservations"
        value={formatNumber(metrics.pending_reservations)}
        description="Awaiting fulfillment"
        icon={BookMarked}
      />

      {showLibrarianMetrics && (
        <>
          <MetricCard
            title="Total Students"
            value={formatNumber(metrics.total_students)}
            description="Registered students"
            icon={Users}
          />
          <MetricCard
            title="Borrowed Today"
            value={formatNumber(metrics.today_borrows)}
            description="Books checked out today"
            icon={BookOpen}
          />
          <MetricCard
            title="Returned Today"
            value={formatNumber(metrics.today_returns)}
            description="Books returned today"
            icon={BookOpen}
          />
          <MetricCard
            title="Unpaid Fines"
            value={formatCurrency(metrics.total_fines)}
            description="Outstanding fines"
            icon={DollarSign}
            className={
              metrics.total_fines > 0
                ? "border-yellow-500/50 bg-yellow-500/5"
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}
