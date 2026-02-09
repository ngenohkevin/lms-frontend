"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Filter,
  Calendar,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCcw,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  TransactionSearchParams,
  TransactionStatus,
  TransactionType,
} from "@/lib/types";

interface TransactionSearchProps {
  onSearch: (params: TransactionSearchParams) => void;
  initialParams?: TransactionSearchParams;
}

// Status quick filter buttons
const statusFilters = [
  { label: "All", value: "", icon: BookOpen },
  { label: "Active", value: "active", icon: Clock },
  { label: "Overdue", value: "overdue", icon: AlertTriangle },
  { label: "Returned", value: "returned", icon: CheckCircle },
  { label: "Lost", value: "lost", icon: SearchX },
];

// Transaction type options
const transactionTypes: { label: string; value: TransactionType | "" }[] = [
  { label: "All Types", value: "" },
  { label: "Borrow", value: "borrow" },
  { label: "Return", value: "return" },
  { label: "Renew", value: "renew" },
];

// Sort options
const sortOptions = [
  { label: "Date (Newest)", value: "transaction_date", order: "desc" as const },
  { label: "Date (Oldest)", value: "transaction_date", order: "asc" as const },
  { label: "Due Date (Soonest)", value: "due_date", order: "asc" as const },
  { label: "Due Date (Latest)", value: "due_date", order: "desc" as const },
];

export function TransactionSearch({
  onSearch,
  initialParams = {},
}: TransactionSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(initialParams.query || "");
  const [status, setStatus] = useState<TransactionStatus | "">(
    initialParams.status || "",
  );
  const [type, setType] = useState<TransactionType | "">(
    initialParams.type || "",
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(
    initialParams.from_date ? new Date(initialParams.from_date) : undefined,
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    initialParams.to_date ? new Date(initialParams.to_date) : undefined,
  );
  const [sortBy, setSortBy] = useState(
    initialParams.sort_by || "transaction_date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    initialParams.sort_order || "desc",
  );

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      const params: TransactionSearchParams = {
        page: 1,
        per_page: initialParams.per_page || 20,
        student_id: initialParams.student_id,
      };

      if (query) params.query = query;
      if (status) params.status = status;
      if (type) params.type = type;
      if (fromDate) params.from_date = format(fromDate, "yyyy-MM-dd");
      if (toDate) params.to_date = format(toDate, "yyyy-MM-dd");
      if (sortBy) params.sort_by = sortBy;
      if (sortOrder) params.sort_order = sortOrder;

      onSearch(params);
    },
    [
      query,
      status,
      type,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
      initialParams,
      onSearch,
    ],
  );

  const clearFilters = () => {
    setQuery("");
    setStatus("");
    setType("");
    setFromDate(undefined);
    setToDate(undefined);
    setSortBy("transaction_date");
    setSortOrder("desc");
    onSearch({
      page: 1,
      per_page: initialParams.per_page || 20,
      student_id: initialParams.student_id,
    });
  };

  const handleStatusFilter = (value: string) => {
    const newStatus = value as TransactionStatus | "";
    setStatus(newStatus);
    const params: TransactionSearchParams = {
      page: 1,
      per_page: initialParams.per_page || 20,
      student_id: initialParams.student_id,
      query: query || undefined,
      status: newStatus || undefined,
      type: type || undefined,
      from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      to_date: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    onSearch(params);
  };

  const handleSortChange = (value: string) => {
    const option = sortOptions.find((o) => `${o.value}-${o.order}` === value);
    if (option) {
      setSortBy(option.value);
      setSortOrder(option.order);
      const params: TransactionSearchParams = {
        page: 1,
        per_page: initialParams.per_page || 20,
        student_id: initialParams.student_id,
        query: query || undefined,
        status: status || undefined,
        type: type || undefined,
        from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        to_date: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        sort_by: option.value,
        sort_order: option.order,
      };
      onSearch(params);
    }
  };

  const activeFiltersCount = [status, type, fromDate, toDate].filter(
    Boolean,
  ).length;

  const hasActiveFilters = status || type || fromDate || toDate;

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by book title, author, student name, or barcode..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-background"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort dropdown */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-11 border border-input">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={`${option.value}-${option.order}`}
                  value={`${option.value}-${option.order}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filters sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative h-11 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6">
              <SheetHeader className="space-y-2">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 shrink-0" />
                  <span>Filter Transactions</span>
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6 pr-2">
                {/* Transaction Type filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Transaction Type
                  </Label>
                  <Select
                    value={type || "all"}
                    onValueChange={(val) =>
                      setType(val === "all" ? "" : (val as TransactionType))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((t) => (
                        <SelectItem
                          key={t.value || "all"}
                          value={t.value || "all"}
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Date Range filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        From
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fromDate && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        To
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !toDate && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleSearch();
                      setIsOpen(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button onClick={() => handleSearch()} className="h-11">
            Search
          </Button>
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={status === filter.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2 transition-all",
              status === filter.value && "shadow-sm",
            )}
            onClick={() => handleStatusFilter(filter.value)}
          >
            <filter.icon className="h-3.5 w-3.5" />
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <Card className="p-3 bg-muted/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">
              Active filters:
            </span>
            {status && (
              <Badge variant="secondary" className="gap-1 pr-1 capitalize">
                {status}
                <button
                  onClick={() => handleStatusFilter("")}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {type && (
              <Badge variant="secondary" className="gap-1 pr-1 capitalize">
                {type}
                <button
                  onClick={() => {
                    setType("");
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {fromDate && (
              <Badge variant="secondary" className="gap-1 pr-1">
                From: {format(fromDate, "PP")}
                <button
                  onClick={() => {
                    setFromDate(undefined);
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {toDate && (
              <Badge variant="secondary" className="gap-1 pr-1">
                To: {format(toDate, "PP")}
                <button
                  onClick={() => {
                    setToDate(undefined);
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
