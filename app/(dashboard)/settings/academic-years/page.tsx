"use client";

import { useState } from "react";
import { useAcademicYears } from "@/lib/hooks/use-academic-years";
import { usePermissions } from "@/providers/permission-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { academicYearsApi } from "@/lib/api/academic-years";
import type { AcademicYear } from "@/lib/types/academic-year";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
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
  GraduationCap,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AcademicYearsPage() {
  const router = useRouter();
  const { academicYears, isLoading, refresh } = useAcademicYears(true); // Include inactive
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PermissionCodes.ACADEMIC_YEARS_MANAGE);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setLevel("");
    setDescription("");
    setEditingYear(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Academic year name is required");
      return;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 13) {
      toast.error("Level must be a number between 1 and 13");
      return;
    }

    setIsSubmitting(true);
    try {
      await academicYearsApi.create({
        name: name.trim(),
        level: levelNum,
        description: description.trim() || undefined,
      });
      toast.success("Academic year created successfully");
      setIsAddOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create academic year");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingYear || !name.trim()) {
      toast.error("Academic year name is required");
      return;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 13) {
      toast.error("Level must be a number between 1 and 13");
      return;
    }

    setIsSubmitting(true);
    try {
      await academicYearsApi.update(editingYear.id, {
        name: name.trim(),
        level: levelNum,
        description: description.trim() || undefined,
      });
      toast.success("Academic year updated successfully");
      setIsEditOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update academic year");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (year: AcademicYear) => {
    try {
      await academicYearsApi.delete(year.id);
      toast.success("Academic year deleted successfully");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete academic year");
    }
  };

  const handleToggleActive = async (year: AcademicYear) => {
    try {
      if (year.is_active) {
        await academicYearsApi.deactivate(year.id);
        toast.success("Academic year deactivated");
      } else {
        await academicYearsApi.activate(year.id);
        toast.success("Academic year activated");
      }
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update academic year");
    }
  };

  const openEditDialog = (year: AcademicYear) => {
    setEditingYear(year);
    setName(year.name);
    setLevel(String(year.level));
    setDescription(year.description || "");
    setIsEditOpen(true);
  };

  return (
    <AuthGuard requiredPermission={PermissionCodes.ACADEMIC_YEARS_MANAGE}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              className="-ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 mt-2">
              <GraduationCap className="h-6 w-6" />
              Academic Years
            </h1>
            <p className="text-muted-foreground">
              Manage academic years/levels for student classification
            </p>
          </div>
          <PermissionGuard permission={PermissionCodes.ACADEMIC_YEARS_MANAGE} hideWhenDenied>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Academic Year
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Academic Year</DialogTitle>
                  <DialogDescription>
                    Create a new academic year/level for student classification
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Year 1, First Year, Freshman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Input
                      id="level"
                      type="number"
                      min={1}
                      max={13}
                      placeholder="e.g., 1"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Numeric level for ordering (1-13). Each level must be unique.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description for this academic year"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Academic Year
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Academic Years Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : academicYears.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No academic years found. Add your first academic year to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell className="font-medium">{year.level}</TableCell>
                      <TableCell>{year.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {year.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={year.is_active ? "default" : "secondary"}>
                          {year.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(year)}
                              title={year.is_active ? "Deactivate" : "Activate"}
                            >
                              {year.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(year)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{year.name}&quot;?
                                    This action cannot be undone. Students in this academic year
                                    will retain their year value.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(year)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
              <DialogTitle>Edit Academic Year</DialogTitle>
              <DialogDescription>
                Update the academic year details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Year 1, First Year, Freshman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Input
                  id="edit-level"
                  type="number"
                  min={1}
                  max={13}
                  placeholder="e.g., 1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Numeric level for ordering (1-13). Each level must be unique.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Optional description for this academic year"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
