"use client";

import { ReactNode } from "react";
import { PrintButton } from "./print-button";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  showPrint?: boolean;
  showExport?: boolean;
}

export function ReportHeader({
  title,
  description,
  children,
  onRefresh,
  onExport,
  isLoading = false,
  showPrint = true,
  showExport = true,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 no-print">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
        {showExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
        {showPrint && <PrintButton variant="outline" size="sm" />}
      </div>
    </div>
  );
}
