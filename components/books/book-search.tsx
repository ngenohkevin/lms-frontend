"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BOOK_CATEGORIES } from "@/lib/types/book";

interface BookSearchProps {
  onSearch?: (params: Record<string, string | undefined>) => void;
}

export function BookSearch({ onSearch }: BookSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [available, setAvailable] = useState(
    searchParams.get("available") === "true"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort_by") || "title"
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (category) params.set("category", category);
    if (available) params.set("available", "true");
    if (sortBy) params.set("sort_by", sortBy);

    const newUrl = `/books${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl);

    if (onSearch) {
      onSearch({
        search: query || undefined,
        category: category || undefined,
        available: available ? "true" : undefined,
        sort_by: sortBy || undefined,
      });
    }
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setAvailable(false);
    setSortBy("title");
    router.push("/books");
    if (onSearch) {
      onSearch({});
    }
  };

  const activeFiltersCount = [category, available].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="publication_year">Year</SelectItem>
            <SelectItem value="average_rating">Rating</SelectItem>
            <SelectItem value="created_at">Recently Added</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Books</SheetTitle>
              <SheetDescription>
                Narrow down your search with these filters.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={available}
                  onCheckedChange={(checked) => setAvailable(checked === true)}
                />
                <Label htmlFor="available">Available only</Label>
              </div>

              <div className="flex gap-2 pt-4">
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

        <Button onClick={() => handleSearch()}>Search</Button>
      </div>

      {/* Active filters display */}
      {(category || available) && (
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="secondary" className="gap-1">
              Category: {category}
              <button
                onClick={() => {
                  setCategory("");
                  handleSearch();
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {available && (
            <Badge variant="secondary" className="gap-1">
              Available only
              <button
                onClick={() => {
                  setAvailable(false);
                  handleSearch();
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
