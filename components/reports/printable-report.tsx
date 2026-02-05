"use client";

import { ReactNode } from "react";

interface PrintableReportProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showFooter?: boolean;
}

export function PrintableReport({
  title,
  subtitle,
  children,
  showFooter = true,
}: PrintableReportProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="printable-report">
      {/* Print Header - only visible when printing */}
      <div className="print-header">
        <h1>{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        <p className="print-date">Generated on: {currentDate}</p>
      </div>

      {/* Report Content */}
      <div className="report-content">{children}</div>

      {/* Print Footer - only visible when printing */}
      {showFooter && (
        <div className="print-footer">
          <p>Library Management System - {title}</p>
        </div>
      )}
    </div>
  );
}

interface PrintSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  avoidBreak?: boolean;
}

export function PrintSection({
  title,
  children,
  className = "",
  pageBreakBefore = false,
  pageBreakAfter = false,
  avoidBreak = true,
}: PrintSectionProps) {
  const breakClasses = [
    pageBreakBefore ? "page-break-before" : "",
    pageBreakAfter ? "page-break-after" : "",
    avoidBreak ? "avoid-break" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`print-section ${breakClasses} ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </section>
  );
}

interface ChartPrintFallbackProps {
  data: Array<Record<string, string | number>>;
  columns: Array<{
    key: string;
    label: string;
    format?: (value: string | number) => string;
  }>;
}

export function ChartPrintFallback({ data, columns }: ChartPrintFallbackProps) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-print-fallback">
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-print-fallback">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left font-medium py-2 px-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-3">
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
