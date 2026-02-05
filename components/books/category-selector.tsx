"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/hooks";
import { categoriesApi, type Category } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

interface CategorySelectorProps {
  value?: string;
  categoryId?: number;
  onChange: (categoryName: string, categoryId?: number) => void;
  disabled?: boolean;
  suggestedGenre?: string;
  onSuggestionUsed?: () => void;
}

export function CategorySelector({
  value,
  categoryId,
  onChange,
  disabled,
  suggestedGenre,
  onSuggestionUsed,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const { categories, refresh: refreshCategories } = useCategories();

  // Filter categories based on search
  const filteredCategories = search
    ? categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.description?.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const selectedCategory = categories.find((c) => c.id === categoryId || c.name === value);

  const handleSelectCategory = (category: Category) => {
    onChange(category.name, category.id);
    setOpen(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsCreating(true);
    try {
      const created = await categoriesApi.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
      });
      toast.success("Category created successfully");
      await refreshCategories();
      onChange(created.name, created.id);
      setCreateDialogOpen(false);
      setNewCategory({ name: "", description: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUseSuggestion = () => {
    if (suggestedGenre) {
      // Check if there's a matching category
      const match = categories.find(
        (cat) => cat.name.toLowerCase() === suggestedGenre.toLowerCase()
      );
      if (match) {
        onChange(match.name, match.id);
        onSuggestionUsed?.();
      } else {
        // Open create dialog with the suggested genre
        setNewCategory({ name: suggestedGenre, description: "" });
        setCreateDialogOpen(true);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>Category *</Label>

      {/* Suggestion from ISBN */}
      {suggestedGenre && !selectedCategory && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-dashed">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm text-muted-foreground">
            ISBN suggests: <strong>{suggestedGenre}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto h-7"
            onClick={handleUseSuggestion}
          >
            Use this
          </Button>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCategory?.name || value || "Select category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filteredCategories.length === 0 ? (
                <CommandEmpty>
                  <div className="py-2 text-center text-sm">
                    No categories found.
                    <Button
                      variant="link"
                      className="block w-full"
                      onClick={() => {
                        setNewCategory({ name: search, description: "" });
                        setCreateDialogOpen(true);
                        setOpen(false);
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Create &quot;{search}&quot;
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  <CommandGroup>
                    {filteredCategories.map((category) => {
                      const isSelected = selectedCategory?.id === category.id;
                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => handleSelectCategory(category)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{category.name}</span>
                            {category.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                                {category.description}
                              </span>
                            )}
                          </div>
                          {!category.is_active && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Inactive
                            </Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setNewCategory({ name: search, description: "" });
                        setCreateDialogOpen(true);
                        setOpen(false);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create new category
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>Add a new category for organizing books</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_category_name">Category Name *</Label>
              <Input
                id="new_category_name"
                placeholder="e.g., Science Fiction"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_category_description">Description</Label>
              <Textarea
                id="new_category_description"
                placeholder="Optional description..."
                rows={3}
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({
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
            <Button onClick={handleCreateCategory} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategorySelector;
