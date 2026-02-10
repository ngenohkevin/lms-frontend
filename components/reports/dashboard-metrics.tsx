"use client";

import {
  Card,
  CardContent,
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
  TrendingDown,
} from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
  index?: number;
}

const variantStyles = {
  default: {
    card: "bg-card hover:shadow-md transition-all duration-200",
    icon: "bg-muted text-muted-foreground",
    iconColor: "text-muted-foreground",
  },
  primary: {
    card: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-200",
    icon: "bg-primary/15 text-primary",
    iconColor: "text-primary",
  },
  success: {
    card: "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    card: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    card: "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20 hover:shadow-md hover:shadow-red-500/5 transition-all duration-200",
    icon: "bg-red-500/15 text-red-600 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
  index = 0,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(styles.card, "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both", className)}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                    trend.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("rounded-xl p-3", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
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
        variant="primary"
        index={0}
      />
      <MetricCard
        title="Active Transactions"
        value={formatNumber(metrics.active_borrows)}
        description="Currently borrowed"
        icon={ArrowLeftRight}
        variant="success"
        index={1}
      />
      <MetricCard
        title="Overdue"
        value={formatNumber(metrics.overdue_books)}
        description="Books past due date"
        icon={AlertTriangle}
        variant={metrics.overdue_books > 0 ? "danger" : "default"}
        index={2}
      />
      <MetricCard
        title="Pending Reservations"
        value={formatNumber(metrics.pending_reservations)}
        description="Awaiting fulfillment"
        icon={BookMarked}
        variant="warning"
        index={3}
      />

      {showLibrarianMetrics && (
        <>
          <MetricCard
            title="Total Students"
            value={formatNumber(metrics.total_students)}
            description="Registered students"
            icon={Users}
            variant="primary"
            index={4}
          />
          <MetricCard
            title="Borrowed Today"
            value={formatNumber(metrics.today_borrows)}
            description="Books checked out today"
            icon={BookOpen}
            variant="success"
            index={5}
          />
          <MetricCard
            title="Returned Today"
            value={formatNumber(metrics.today_returns)}
            description="Books returned today"
            icon={BookOpen}
            variant="success"
            index={6}
          />
          <MetricCard
            title="Unpaid Fines"
            value={formatCurrency(metrics.total_fines)}
            description="Outstanding fines"
            icon={DollarSign}
            variant={metrics.total_fines > 0 ? "warning" : "default"}
            index={7}
          />
        </>
      )}
    </div>
  );
}
