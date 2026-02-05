"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useBookCopies } from "@/lib/hooks/use-book-copies";
import type { BookCopy } from "@/lib/types/book";
import { COPY_CONDITIONS, COPY_STATUSES } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CopySelectorProps {
  bookId: number;
  value?: number;
  onSelect: (copy: BookCopy | null) => void;
  disabled?: boolean;
  showOnlyAvailable?: boolean;
  placeholder?: string;
  className?: string;
}

function getConditionColor(condition: string): string {
  switch (condition) {
    case "excellent":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "good":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "fair":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "poor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "damaged":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "borrowed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "reserved":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

/**
 * CopySelector - A dropdown for selecting which copy to borrow
 *
 * Features:
 * - Shows copy number, barcode, condition, and status
 * - Filters to only show available copies by default
 * - Searchable by copy number or barcode
 */
export function CopySelector({
  bookId,
  value,
  onSelect,
  disabled = false,
  showOnlyAvailable = true,
  placeholder = "Select a copy...",
  className,
}: CopySelectorProps) {
  const [open, setOpen] = useState(false);
  const { copies, isLoading } = useBookCopies(bookId);

  // Filter copies based on showOnlyAvailable
  const filteredCopies = showOnlyAvailable
    ? copies.filter((copy) => copy.status === "available")
    : copies;

  // Find the selected copy
  const selectedCopy = copies.find((copy) => copy.id === value);

  const handleSelect = (copy: BookCopy) => {
    if (copy.id === value) {
      // Deselect if clicking the same copy
      onSelect(null);
    } else {
      onSelect(copy);
    }
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className={cn("w-full justify-between", className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading copies...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || filteredCopies.length === 0}
          className={cn("w-full justify-between", className)}
        >
          {selectedCopy ? (
            <span className="flex items-center gap-2 truncate">
              <span className="font-medium">{selectedCopy.barcode}</span>
            </span>
          ) : filteredCopies.length === 0 ? (
            <span className="text-muted-foreground">No available copies</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by barcode..." />
          <CommandList>
            <CommandEmpty>No copies found.</CommandEmpty>
            <CommandGroup>
              {filteredCopies.map((copy) => (
                <CommandItem
                  key={copy.id}
                  value={copy.barcode}
                  onSelect={() => handleSelect(copy)}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === copy.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-medium">{copy.barcode}</span>
                    </div>
                    <div className="flex gap-2 ml-6">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getConditionColor(copy.condition))}
                      >
                        {COPY_CONDITIONS.find((c) => c.value === copy.condition)?.label ||
                          copy.condition}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getStatusColor(copy.status))}
                      >
                        {COPY_STATUSES.find((s) => s.value === copy.status)?.label ||
                          copy.status}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CopySelector;
