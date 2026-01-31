"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Barcode,
  Loader2,
} from "lucide-react";
import { useBookCopies } from "@/lib/hooks/use-book-copies";
import { bookCopiesApi } from "@/lib/api/book-copies";
import type { BookCopy, BookCopyFormData, CopyCondition, CopyStatus } from "@/lib/types/book";
import { COPY_CONDITIONS, COPY_STATUSES } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookCopyForm } from "./book-copy-form";
import { Skeleton } from "@/components/ui/skeleton";

interface BookCopiesListProps {
  bookId: number;
  bookTitle?: string;
}

function getConditionColor(condition: CopyCondition): string {
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

function getStatusColor(status: CopyStatus): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "borrowed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "reserved":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "lost":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "damaged":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export function BookCopiesList({ bookId, bookTitle }: BookCopiesListProps) {
  const { copies, isLoading, refresh } = useBookCopies(bookId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [deletingCopy, setDeletingCopy] = useState<BookCopy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: BookCopyFormData) => {
    setIsSubmitting(true);
    try {
      await bookCopiesApi.create(bookId, data);
      toast.success("Copy added successfully");
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      toast.error("Failed to add copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: BookCopyFormData) => {
    if (!editingCopy) return;
    setIsSubmitting(true);
    try {
      await bookCopiesApi.update(bookId, editingCopy.id, data);
      toast.success("Copy updated successfully");
      setEditingCopy(null);
      refresh();
    } catch (error) {
      toast.error("Failed to update copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCopy) return;
    setIsSubmitting(true);
    try {
      await bookCopiesApi.delete(bookId, deletingCopy.id);
      toast.success("Copy deleted successfully");
      setDeletingCopy(null);
      refresh();
    } catch (error) {
      toast.error("Failed to delete copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Book Copies</CardTitle>
            <CardDescription>
              {copies.length} {copies.length === 1 ? "copy" : "copies"}{" "}
              {bookTitle && `of "${bookTitle}"`}
            </CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Copy</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardHeader>
        <CardContent>
          {copies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Barcode className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No copies registered yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Copy
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Copy #</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acquired</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {copies.map((copy) => (
                      <TableRow key={copy.id}>
                        <TableCell className="font-medium">
                          {copy.copy_number}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {copy.barcode || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getConditionColor(copy.condition)}>
                            {COPY_CONDITIONS.find((c) => c.value === copy.condition)
                              ?.label || copy.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(copy.status)}>
                            {COPY_STATUSES.find((s) => s.value === copy.status)
                              ?.label || copy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {copy.acquisition_date
                            ? new Date(copy.acquisition_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingCopy(copy)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingCopy(copy)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {copies.map((copy) => (
                  <div
                    key={copy.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{copy.copy_number}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCopy(copy)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingCopy(copy)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {copy.barcode && (
                      <div className="text-sm text-muted-foreground font-mono">
                        {copy.barcode}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getConditionColor(copy.condition)}>
                        {COPY_CONDITIONS.find((c) => c.value === copy.condition)
                          ?.label || copy.condition}
                      </Badge>
                      <Badge className={getStatusColor(copy.status)}>
                        {COPY_STATUSES.find((s) => s.value === copy.status)
                          ?.label || copy.status}
                      </Badge>
                    </div>
                    {copy.acquisition_date && (
                      <div className="text-sm text-muted-foreground">
                        Acquired:{" "}
                        {new Date(copy.acquisition_date).toLocaleDateString()}
                      </div>
                    )}
                    {copy.notes && (
                      <div className="text-sm text-muted-foreground">
                        {copy.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Copy Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Copy</DialogTitle>
            <DialogDescription>
              Register a new copy of this book
            </DialogDescription>
          </DialogHeader>
          <BookCopyForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Copy Dialog */}
      <Dialog open={!!editingCopy} onOpenChange={() => setEditingCopy(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Copy</DialogTitle>
            <DialogDescription>
              Update copy information for {editingCopy?.copy_number}
            </DialogDescription>
          </DialogHeader>
          {editingCopy && (
            <BookCopyForm
              initialData={editingCopy}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              onCancel={() => setEditingCopy(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCopy} onOpenChange={() => setDeletingCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Copy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete copy "{deletingCopy?.copy_number}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BookCopiesList;
