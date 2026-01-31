"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthors, useAuthorSearch } from "@/lib/hooks/use-authors";
import { authorsApi } from "@/lib/api/authors";
import type { Author, AuthorFormData } from "@/lib/types/book";
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

interface AuthorSelectorProps {
  selectedAuthors: Author[];
  onChange: (authors: Author[]) => void;
  disabled?: boolean;
}

export function AuthorSelector({
  selectedAuthors,
  onChange,
  disabled,
}: AuthorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAuthor, setNewAuthor] = useState<AuthorFormData>({
    name: "",
    bio: "",
  });

  const { authors: allAuthors, refresh: refreshAuthors } = useAuthors(1, 100);
  const { authors: searchResults, isLoading: isSearching } = useAuthorSearch(
    search,
    1,
    10
  );

  const displayAuthors = search ? searchResults : allAuthors;

  const handleSelectAuthor = (author: Author) => {
    const isSelected = selectedAuthors.some((a) => a.id === author.id);
    if (isSelected) {
      onChange(selectedAuthors.filter((a) => a.id !== author.id));
    } else {
      onChange([...selectedAuthors, author]);
    }
  };

  const handleRemoveAuthor = (authorId: number) => {
    onChange(selectedAuthors.filter((a) => a.id !== authorId));
  };

  const handleCreateAuthor = async () => {
    if (!newAuthor.name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setIsCreating(true);
    try {
      const created = await authorsApi.create(newAuthor);
      toast.success("Author created successfully");
      await refreshAuthors();
      onChange([...selectedAuthors, created]);
      setCreateDialogOpen(false);
      setNewAuthor({ name: "", bio: "" });
    } catch (error) {
      toast.error("Failed to create author");
    } finally {
      setIsCreating(false);
    }
  };

  const moveAuthor = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedAuthors.length) return;
    const newOrder = [...selectedAuthors];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    onChange(newOrder);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Authors</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              {selectedAuthors.length > 0
                ? `${selectedAuthors.length} author${selectedAuthors.length > 1 ? "s" : ""} selected`
                : "Select authors..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[300px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search authors..."
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
                        No authors found.
                        <Button
                          variant="link"
                          className="block w-full"
                          onClick={() => {
                            setNewAuthor({ name: search, bio: "" });
                            setCreateDialogOpen(true);
                            setOpen(false);
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Create "{search}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {displayAuthors.map((author) => {
                        const isSelected = selectedAuthors.some(
                          (a) => a.id === author.id
                        );
                        return (
                          <CommandItem
                            key={author.id}
                            value={author.name}
                            onSelect={() => handleSelectAuthor(author)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {author.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setNewAuthor({ name: search, bio: "" });
                          setCreateDialogOpen(true);
                          setOpen(false);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create new author
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Authors List with Reordering */}
      {selectedAuthors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Author Order (drag to reorder)
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedAuthors.map((author, index) => (
              <Badge
                key={author.id}
                variant="secondary"
                className="flex items-center gap-1 py-1.5 pl-2 pr-1"
              >
                <span className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {index + 1}.
                  </span>
                  {author.name}
                </span>
                <div className="flex items-center ml-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => moveAuthor(index, index - 1)}
                    disabled={index === 0 || disabled}
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                    onClick={() => handleRemoveAuthor(author.id)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Create Author Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Author</DialogTitle>
            <DialogDescription>Add a new author to the library</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_author_name">Author Name *</Label>
              <Input
                id="new_author_name"
                placeholder="e.g., J.K. Rowling"
                value={newAuthor.name}
                onChange={(e) =>
                  setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_author_bio">Biography</Label>
              <Textarea
                id="new_author_bio"
                placeholder="Optional biography..."
                rows={3}
                value={newAuthor.bio || ""}
                onChange={(e) =>
                  setNewAuthor((prev) => ({
                    ...prev,
                    bio: e.target.value,
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
            <Button onClick={handleCreateAuthor} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Author"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuthorSelector;
