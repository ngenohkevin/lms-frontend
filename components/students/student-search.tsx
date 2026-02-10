"use client";

import { useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  Users,
  AlertTriangle,
  DollarSign,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STUDENT_STATUSES, type StudentStatus } from "@/lib/types";
import { useDepartments } from "@/lib/hooks/use-departments";
import { useAcademicYears } from "@/lib/hooks/use-academic-years";

interface StudentSearchProps {
  onSearch?: (params: Record<string, string | boolean | number | undefined>) => void;
  initialValues?: {
    query?: string;
    department?: string;
    year_of_study?: number;
    status?: StudentStatus;
    has_overdue?: boolean;
    has_fines?: boolean;
  };
}

// Quick filter presets
const quickFilters = [
  { label: "Active", value: "active", icon: Users },
  { label: "Has Overdue", value: "overdue", icon: AlertTriangle },
  { label: "Has Fines", value: "fines", icon: DollarSign },
];

export function StudentSearch({
  onSearch,
  initialValues = {},
}: StudentSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [query, setQuery] = useState(initialValues.query || "");
  const [department, setDepartment] = useState(initialValues.department || "");
  const [yearOfStudy, setYearOfStudy] = useState<number | undefined>(initialValues.year_of_study);
  const [status, setStatus] = useState<StudentStatus | "">(initialValues.status || "");
  const [hasOverdue, setHasOverdue] = useState(initialValues.has_overdue || false);
  const [hasFines, setHasFines] = useState(initialValues.has_fines || false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // Load departments and academic years dynamically
  const { departments } = useDepartments();
  const { academicYears } = useAcademicYears();

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      if (onSearch) {
        onSearch({
          query: query || undefined,
          department: department || undefined,
          year_of_study: yearOfStudy || undefined,
          status: status || undefined,
          has_overdue: hasOverdue || undefined,
          has_fines: hasFines || undefined,
        });
      }
    },
    [query, department, yearOfStudy, status, hasOverdue, hasFines, onSearch]
  );

  const clearFilters = () => {
    setQuery("");
    setDepartment("");
    setYearOfStudy(undefined);
    setStatus("");
    setHasOverdue(false);
    setHasFines(false);
    setQuickFilter(null);
    if (onSearch) {
      onSearch({});
    }
  };

  const applyQuickFilter = (filterValue: string) => {
    if (quickFilter === filterValue) {
      setQuickFilter(null);
      clearFilters();
      return;
    }

    setQuickFilter(filterValue);

    switch (filterValue) {
      case "active":
        setStatus("active");
        setHasOverdue(false);
        setHasFines(false);
        break;
      case "overdue":
        setHasOverdue(true);
        break;
      case "fines":
        setHasFines(true);
        break;
    }

    setTimeout(() => handleSearch(), 0);
  };

  const activeFiltersCount = [
    department,
    yearOfStudy,
    status,
    hasOverdue,
    hasFines,
  ].filter(Boolean).length;

  const hasActiveFilters =
    department || yearOfStudy || status || hasOverdue || hasFines;

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or student ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-background"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Status dropdown (quick access) */}
          <Select value={status || "all"} onValueChange={(val) => { setStatus(val === "all" ? "" : val as StudentStatus); setTimeout(() => handleSearch(), 0); }}>
            <SelectTrigger className="w-full sm:w-[140px] h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STUDENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
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
            <SheetContent className="w-full sm:max-w-md overflow-y-auto p-4 sm:p-6">
              <SheetHeader className="space-y-2">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 shrink-0" />
                  <span>Filter Students</span>
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6 pr-2">
                {/* Department filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Department</Label>
                  <Select value={department || "all"} onValueChange={(val) => setDepartment(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Year of Study filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Year of Study</Label>
                  <Select
                    value={yearOfStudy?.toString() || "all"}
                    onValueChange={(val) => setYearOfStudy(val === "all" ? undefined : parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.level.toString()}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Status filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Status</Label>
                  <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? "" : val as StudentStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {STUDENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Has Overdue filter */}
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="has_overdue" className="text-sm font-semibold cursor-pointer">
                      Has Overdue Books
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show students with overdue items
                    </p>
                  </div>
                  <Switch
                    id="has_overdue"
                    checked={hasOverdue}
                    onCheckedChange={(checked) => setHasOverdue(checked)}
                  />
                </div>

                <Separator />

                {/* Has Fines filter */}
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="has_fines" className="text-sm font-semibold cursor-pointer">
                      Has Unpaid Fines
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show students with outstanding fines
                    </p>
                  </div>
                  <Switch
                    id="has_fines"
                    checked={hasFines}
                    onCheckedChange={(checked) => setHasFines(checked)}
                  />
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

          <Button onClick={() => handleSearch()} className="h-11 hidden sm:inline-flex">
            Search
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={quickFilter === filter.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2 transition-all",
              quickFilter === filter.value && "shadow-sm"
            )}
            onClick={() => applyQuickFilter(filter.value)}
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
            {department && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {department}
                <button
                  onClick={() => {
                    setDepartment("");
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {yearOfStudy && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Year {yearOfStudy}
                <button
                  onClick={() => {
                    setYearOfStudy(undefined);
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="gap-1 pr-1 capitalize">
                {status}
                <button
                  onClick={() => {
                    setStatus("");
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasOverdue && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Has Overdue
                <button
                  onClick={() => {
                    setHasOverdue(false);
                    handleSearch();
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasFines && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Has Fines
                <button
                  onClick={() => {
                    setHasFines(false);
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
