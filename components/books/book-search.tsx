"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Sparkles,
  BookOpen,
  Headphones,
  Tablet,
  Globe,
  Library,
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
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/hooks";
import { useSeries } from "@/lib/hooks/use-series";
import { BOOK_LANGUAGES, BOOK_FORMATS, type BookFormat } from "@/lib/types/book";

interface BookSearchProps {
  onSearch?: (params: Record<string, string | undefined>) => void;
  onViewChange?: (view: "grid" | "list") => void;
  view?: "grid" | "list";
}

const currentYear = new Date().getFullYear();

// Quick filter presets
const quickFilters = [
  { label: "New Arrivals", value: "new", icon: Sparkles },
  { label: "Available Now", value: "available", icon: Filter },
  { label: "E-Books", value: "ebook", icon: Tablet },
  { label: "Audiobooks", value: "audiobook", icon: Headphones },
];

// Format icons
const formatIcons: Record<BookFormat, typeof BookOpen> = {
  physical: BookOpen,
  ebook: Tablet,
  audiobook: Headphones,
};

export function BookSearch({
  onSearch,
  onViewChange,
  view = "grid",
}: BookSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(true);
  const { categories } = useCategories();
  const { series: seriesList } = useSeries(1, 100);

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [available, setAvailable] = useState(
    searchParams.get("available") === "true"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "title");
  const [yearRange, setYearRange] = useState<[number, number]>([1900, currentYear]);
  const [minRating, setMinRating] = useState(0);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  // New filter states
  const [language, setLanguage] = useState(searchParams.get("language") || "");
  const [format, setFormat] = useState(searchParams.get("format") || "");
  const [seriesId, setSeriesId] = useState(searchParams.get("series_id") || "");

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (category) params.set("category", category);
      if (available) params.set("available", "true");
      if (sortBy) params.set("sort_by", sortBy);
      if (yearRange[0] > 1900) params.set("year_from", String(yearRange[0]));
      if (yearRange[1] < currentYear) params.set("year_to", String(yearRange[1]));
      if (minRating > 0) params.set("min_rating", String(minRating));
      // New filters
      if (language) params.set("language", language);
      if (format) params.set("format", format);
      if (seriesId) params.set("series_id", seriesId);

      const newUrl = `/books${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(newUrl);

      if (onSearch) {
        onSearch({
          query: query || undefined,
          category: category || undefined,
          available: available ? "true" : undefined,
          sort_by: sortBy || undefined,
          year_from: yearRange[0] > 1900 ? String(yearRange[0]) : undefined,
          year_to: yearRange[1] < currentYear ? String(yearRange[1]) : undefined,
          min_rating: minRating > 0 ? String(minRating) : undefined,
          language: language || undefined,
          format: format || undefined,
          series_id: seriesId || undefined,
        });
      }
    },
    [query, category, available, sortBy, yearRange, minRating, language, format, seriesId, router, onSearch]
  );

  // Build current filter params with overrides — used by badge X buttons
  // to pass the correct values directly (avoids stale state from setState + handleSearch)
  const buildParams = (overrides: Record<string, string | boolean | undefined> = {}) => {
    const merged = {
      query: query || undefined,
      category: category || undefined,
      available: available ? "true" : undefined,
      sort_by: sortBy || undefined,
      language: language || undefined,
      format: format || undefined,
      series_id: seriesId || undefined,
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, v === false || v === "" ? undefined : v])
      ),
    } as Record<string, string | undefined>;
    return merged;
  };

  const removeFilter = (overrides: Record<string, string | boolean | undefined>) => {
    const params = buildParams(overrides);
    setQuickFilter(null);
    onSearch?.(params);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setAvailable(false);
    setSortBy("title");
    setYearRange([1900, currentYear]);
    setMinRating(0);
    setQuickFilter(null);
    setLanguage("");
    setFormat("");
    setSeriesId("");
    router.push("/books");
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

    // Build filter params and call onSearch directly to avoid stale state
    const filterParams: Record<string, string | undefined> = {
      query: query || undefined,
      category: category || undefined,
      sort_by: sortBy || undefined,
      language: language || undefined,
      series_id: seriesId || undefined,
    };

    switch (filterValue) {
      case "new":
        setSortBy("-created_at");
        setAvailable(false);
        setFormat("");
        filterParams.sort_by = "-created_at";
        filterParams.available = undefined;
        filterParams.format = undefined;
        break;
      case "available":
        setAvailable(true);
        setFormat("");
        filterParams.available = "true";
        filterParams.format = undefined;
        break;
      case "ebook":
        setFormat("ebook");
        filterParams.format = "ebook";
        break;
      case "audiobook":
        setFormat("audiobook");
        filterParams.format = "audiobook";
        break;
    }

    // Push URL and notify parent immediately
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/books${params.toString() ? `?${params.toString()}` : ""}`);
    onSearch?.(filterParams);
  };

  const activeFiltersCount = [
    category,
    available,
    yearRange[0] > 1900,
    yearRange[1] < currentYear,
    minRating > 0,
    language,
    format,
    seriesId,
  ].filter(Boolean).length;

  const hasActiveFilters =
    category ||
    available ||
    yearRange[0] > 1900 ||
    yearRange[1] < currentYear ||
    minRating > 0 ||
    language ||
    format ||
    seriesId;

  const getLanguageName = (code: string) => {
    return BOOK_LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  const getFormatLabel = (value: string) => {
    return BOOK_FORMATS.find((f) => f.value === value)?.label || value;
  };

  const getSeriesName = (id: string) => {
    return seriesList.find((s) => String(s.id) === id)?.name || id;
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, ISBN, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-background"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(value) => { setSortBy(value); handleSearch(); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 border border-input">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="-title">Title (Z-A)</SelectItem>
              <SelectItem value="author">Author (A-Z)</SelectItem>
              <SelectItem value="-publication_year">Newest First</SelectItem>
              <SelectItem value="publication_year">Oldest First</SelectItem>
              <SelectItem value="-average_rating">Highest Rated</SelectItem>
              <SelectItem value="-created_at">Recently Added</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          {onViewChange && (
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => onViewChange("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => onViewChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

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
                  <span>Filter Books</span>
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6 pr-2">
                {/* Category filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Category</Label>
                  <Select value={category || "all"} onValueChange={(val) => setCategory(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Format filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Format
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={!format ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormat("")}
                      className="w-full"
                    >
                      All
                    </Button>
                    {BOOK_FORMATS.map((fmt) => {
                      const Icon = formatIcons[fmt.value];
                      return (
                        <Button
                          key={fmt.value}
                          variant={format === fmt.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormat(fmt.value)}
                          className="w-full gap-1"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{fmt.label.split(" ")[0]}</span>
                          <span className="sm:hidden">{fmt.value === "physical" ? "Book" : fmt.label.split(" ")[0]}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Language filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Language
                  </Label>
                  <Select value={language || "all"} onValueChange={(val) => setLanguage(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      {BOOK_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Series filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Library className="h-4 w-4" />
                    Series
                  </Label>
                  <Select value={seriesId || "all"} onValueChange={(val) => setSeriesId(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All series</SelectItem>
                      {seriesList.map((series) => (
                        <SelectItem key={series.id} value={String(series.id)}>
                          {series.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Availability filter */}
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="available" className="text-sm font-semibold cursor-pointer">
                      Availability
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show only books in stock
                    </p>
                  </div>
                  <Switch
                    id="available"
                    checked={available}
                    onCheckedChange={(checked) => setAvailable(checked)}
                  />
                </div>

                <Separator />

                {/* Publication year range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm font-semibold shrink-0">Publication Year</Label>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {yearRange[0]} - {yearRange[1]}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={yearRange}
                      onValueChange={(value) => setYearRange(value as [number, number])}
                      min={1900}
                      max={currentYear}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>1900</span>
                    <span>{currentYear}</span>
                  </div>
                </div>

                <Separator />

                {/* Minimum rating */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Minimum Rating</Label>
                    <span className="text-sm text-muted-foreground">
                      {minRating > 0 ? `${minRating}+ stars` : "Any"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMinRating(rating)}
                        className="px-2 text-xs"
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                      </Button>
                    ))}
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

      {/* Quick filters */}
      <Collapsible open={showQuickFilters} onOpenChange={setShowQuickFilters}>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Collapsible>

      {/* Active filters display */}
      {hasActiveFilters && (
        <Card className="p-3 bg-muted/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">
              Active filters:
            </span>
            {category && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {category}
                <button
                  onClick={() => { setCategory(""); removeFilter({ category: "" }); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {format && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getFormatLabel(format)}
                <button
                  onClick={() => { setFormat(""); removeFilter({ format: "" }); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {language && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getLanguageName(language)}
                <button
                  onClick={() => { setLanguage(""); removeFilter({ language: "" }); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {seriesId && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getSeriesName(seriesId)}
                <button
                  onClick={() => { setSeriesId(""); removeFilter({ series_id: "" }); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {available && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Available
                <button
                  onClick={() => { setAvailable(false); removeFilter({ available: false }); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(yearRange[0] > 1900 || yearRange[1] < currentYear) && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {yearRange[0]}-{yearRange[1]}
                <button
                  onClick={() => { setYearRange([1900, currentYear]); removeFilter({}); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minRating > 0 && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {minRating}+ stars
                <button
                  onClick={() => { setMinRating(0); removeFilter({}); }}
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
