"use client";

import { useState } from "react";
import { useLanguages } from "@/lib/hooks/use-languages";
import { usePermissions } from "@/providers/permission-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { languagesApi, type Language } from "@/lib/api/languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Languages as LanguagesIcon,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function LanguagesPage() {
  const { languages, isLoading, refresh } = useLanguages(true); // Include inactive
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(PermissionCodes.LANGUAGES_CREATE);
  const canUpdate = hasPermission(PermissionCodes.LANGUAGES_UPDATE);
  const canDelete = hasPermission(PermissionCodes.LANGUAGES_DELETE);
  const canManage = canCreate || canUpdate || canDelete;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nativeName, setNativeName] = useState("");

  const resetForm = () => {
    setCode("");
    setName("");
    setNativeName("");
    setEditingLanguage(null);
  };

  const handleAdd = async () => {
    if (!code.trim()) {
      toast.error("Language code is required");
      return;
    }
    if (!name.trim()) {
      toast.error("Language name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await languagesApi.create({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        native_name: nativeName.trim() || undefined,
      });
      toast.success("Language created successfully");
      setIsAddOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create language");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingLanguage || !code.trim() || !name.trim()) {
      toast.error("Language code and name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await languagesApi.update(editingLanguage.id, {
        code: code.trim().toLowerCase(),
        name: name.trim(),
        native_name: nativeName.trim() || undefined,
      });
      toast.success("Language updated successfully");
      setIsEditOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update language");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (language: Language) => {
    try {
      await languagesApi.delete(language.id);
      toast.success("Language deleted successfully");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete language");
    }
  };

  const handleToggleActive = async (language: Language) => {
    try {
      if (language.is_active) {
        await languagesApi.deactivate(language.id);
        toast.success("Language deactivated");
      } else {
        await languagesApi.activate(language.id);
        toast.success("Language activated");
      }
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update language");
    }
  };

  const openEditDialog = (language: Language) => {
    setEditingLanguage(language);
    setCode(language.code);
    setName(language.name);
    setNativeName(language.native_name || "");
    setIsEditOpen(true);
  };

  return (
    <AuthGuard requiredPermission={PermissionCodes.LANGUAGES_VIEW}>
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
                <LanguagesIcon className="h-6 w-6" />
                Languages
              </h1>
              <p className="text-muted-foreground">
                Manage languages for books in the library
              </p>
            </div>
          </div>
          <PermissionGuard permission={PermissionCodes.LANGUAGES_CREATE} hideWhenDenied>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Language</DialogTitle>
                  <DialogDescription>
                    Create a new language for organizing books
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., en, sw, fr"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      ISO 639-1 language code (2-3 characters)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., English"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="native-name">Native Name</Label>
                    <Input
                      id="native-name"
                      placeholder="e.g., Kiswahili, Français"
                      value={nativeName}
                      onChange={(e) => setNativeName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The language name in its native script
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Language
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Languages Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : languages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No languages found. Add your first language to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Native Name</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell className="font-mono font-medium">
                        {language.code.toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">{language.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {language.native_name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={language.is_active ? "default" : "secondary"}>
                          {language.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleActive(language)}
                                title={language.is_active ? "Deactivate" : "Activate"}
                              >
                                {language.is_active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(language)}
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
                                    <AlertDialogTitle>Delete Language</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{language.name}&quot;?
                                      This action cannot be undone. Books using this language
                                      will retain their language value.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(language)}
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
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Language</DialogTitle>
              <DialogDescription>
                Update the language details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  placeholder="e.g., en, sw, fr"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., English"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-native-name">Native Name</Label>
                <Input
                  id="edit-native-name"
                  placeholder="e.g., Kiswahili, Français"
                  value={nativeName}
                  onChange={(e) => setNativeName(e.target.value)}
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
