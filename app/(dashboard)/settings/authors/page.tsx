"use client";

import { useState } from "react";
import { usePermissions } from "@/providers/permission-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { authorsApi } from "@/lib/api/authors";
import type { Author, AuthorFormData } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  ArrowLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

export default function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(PermissionCodes.AUTHORS_CREATE);
  const canUpdate = hasPermission(PermissionCodes.AUTHORS_UPDATE);
  const canDelete = hasPermission(PermissionCodes.AUTHORS_DELETE);
  const canManage = canCreate || canUpdate || canDelete;

  const { data, isLoading, mutate } = useSWR(
    ["/api/v1/authors", page, searchQuery],
    () => searchQuery
      ? authorsApi.search(searchQuery, page, 20)
      : authorsApi.list(page, 20),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const authors = data?.data || [];
  const pagination = data?.pagination;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const resetForm = () => {
    setName("");
    setBio("");
    setEditingAuthor(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await authorsApi.create({
        name: name.trim(),
        bio: bio.trim() || undefined,
      });
      toast.success("Author created successfully");
      setIsAddOpen(false);
      resetForm();
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create author");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAuthor || !name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await authorsApi.update(editingAuthor.id, {
        name: name.trim(),
        bio: bio.trim() || undefined,
      });
      toast.success("Author updated successfully");
      setIsEditOpen(false);
      resetForm();
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update author");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (author: Author) => {
    try {
      await authorsApi.delete(author.id);
      toast.success("Author deleted successfully");
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete author");
    }
  };

  const openEditDialog = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setBio(author.bio || "");
    setIsEditOpen(true);
  };

  return (
    <AuthGuard requiredPermission={PermissionCodes.AUTHORS_VIEW}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6" />
                Authors
              </h1>
              <p className="text-muted-foreground">
                Manage authors for books in the library
              </p>
            </div>
          </div>
          <PermissionGuard permission={PermissionCodes.AUTHORS_CREATE} hideWhenDenied>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Author</DialogTitle>
                  <DialogDescription>
                    Create a new author record
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      placeholder="Optional biography for this author"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Author
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search authors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Authors Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : authors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No authors found matching your search."
                  : "No authors found. Add your first author to get started."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Biography</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell className="font-medium">{author.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[400px] truncate">
                        {author.bio || "—"}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(author)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Author</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{author.name}&quot;?
                                      This action cannot be undone. Books by this author
                                      will no longer be associated with them.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(author)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.total_pages} ({pagination.total} authors)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.has_prev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Author</DialogTitle>
              <DialogDescription>
                Update the author details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Biography</Label>
                <Textarea
                  id="edit-bio"
                  placeholder="Optional biography for this author"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
