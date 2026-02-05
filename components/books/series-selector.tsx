"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSeries, useSeriesSearch } from "@/lib/hooks/use-series";
import { seriesApi } from "@/lib/api/series";
import type { SeriesFormData } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SeriesSelectorProps {
  value?: number | null;
  onChange: (seriesId: number | null, seriesNumber?: number) => void;
  seriesNumber?: number;
  onSeriesNumberChange?: (num: number | undefined) => void;
  disabled?: boolean;
}

export function SeriesSelector({
  value,
  onChange,
  seriesNumber,
  onSeriesNumberChange,
  disabled,
}: SeriesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSeries, setNewSeries] = useState<SeriesFormData>({
    name: "",
    description: "",
  });

  const { series: allSeries, refresh: refreshSeries } = useSeries(1, 100);
  const { series: searchResults, isLoading: isSearching } = useSeriesSearch(
    search,
    1,
    10
  );

  const displaySeries = search ? searchResults : allSeries;
  const selectedSeries = allSeries.find((s) => s.id === value);

  const handleCreateSeries = async () => {
    if (!newSeries.name.trim()) {
      toast.error("Series name is required");
      return;
    }

    setIsCreating(true);
    try {
      const created = await seriesApi.create(newSeries);
      toast.success("Series created successfully");
      await refreshSeries();
      onChange(created.id);
      setCreateDialogOpen(false);
      setNewSeries({ name: "", description: "" });
    } catch {
      toast.error("Failed to create series");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Series</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              {selectedSeries ? selectedSeries.name : "Select series..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[300px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search series..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <div className="py-2 text-center text-sm">
                        No series found.
                        <Button
                          variant="link"
                          className="block w-full"
                          onClick={() => {
                            setNewSeries({ name: search, description: "" });
                            setCreateDialogOpen(true);
                            setOpen(false);
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Create &quot;{search}&quot;
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          onChange(null);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === null ? "opacity-100" : "opacity-0"
                          )}
                        />
                        No series
                      </CommandItem>
                      {displaySeries.map((series) => (
                        <CommandItem
                          key={series.id}
                          value={series.name}
                          onSelect={() => {
                            onChange(series.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === series.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {series.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setNewSeries({ name: search, description: "" });
                          setCreateDialogOpen(true);
                          setOpen(false);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create new series
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {value && onSeriesNumberChange && (
        <div className="space-y-2">
          <Label htmlFor="series_number">Book # in Series</Label>
          <Input
            id="series_number"
            type="number"
            min={1}
            placeholder="e.g., 1"
            value={seriesNumber || ""}
            onChange={(e) =>
              onSeriesNumberChange(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            disabled={disabled}
            className="w-full sm:w-32"
          />
        </div>
      )}

      {/* Create Series Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Series</DialogTitle>
            <DialogDescription>
              Add a new book series to the library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_series_name">Series Name *</Label>
              <Input
                id="new_series_name"
                placeholder="e.g., Harry Potter"
                value={newSeries.name}
                onChange={(e) =>
                  setNewSeries((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_series_description">Description</Label>
              <Textarea
                id="new_series_description"
                placeholder="Optional description..."
                rows={3}
                value={newSeries.description || ""}
                onChange={(e) =>
                  setNewSeries((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSeries} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Series"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SeriesSelector;
