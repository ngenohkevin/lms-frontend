"use client";

import { useState } from "react";
import { useDepartments } from "@/lib/hooks/use-departments";
import { usePermissions } from "@/providers/permission-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { departmentsApi } from "@/lib/api/departments";
import type { Department } from "@/lib/types/department";
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
  Building2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DepartmentsPage() {
  const router = useRouter();
  const { departments, isLoading, refresh } = useDepartments(true); // Include inactive
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PermissionCodes.DEPARTMENTS_MANAGE);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setEditingDepartment(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await departmentsApi.create({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success("Department created successfully");
      setIsAddOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingDepartment || !name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await departmentsApi.update(editingDepartment.id, {
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success("Department updated successfully");
      setIsEditOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (department: Department) => {
    try {
      await departmentsApi.delete(department.id);
      toast.success("Department deleted successfully");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete department");
    }
  };

  const handleToggleActive = async (department: Department) => {
    try {
      if (department.is_active) {
        await departmentsApi.deactivate(department.id);
        toast.success("Department deactivated");
      } else {
        await departmentsApi.activate(department.id);
        toast.success("Department activated");
      }
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update department");
    }
  };

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department);
    setName(department.name);
    setCode(department.code || "");
    setDescription(department.description || "");
    setIsEditOpen(true);
  };

  return (
    <AuthGuard requiredPermission={PermissionCodes.DEPARTMENTS_MANAGE}>
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
              <Building2 className="h-6 w-6" />
              Departments
            </h1>
            <p className="text-muted-foreground">
              Manage departments for organizing students
            </p>
          </div>
          <PermissionGuard permission={PermissionCodes.DEPARTMENTS_MANAGE} hideWhenDenied>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Create a new department for organizing students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Computer Science"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g., CS"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={20}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional short code for the department (max 20 characters)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description for this department"
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
                    Create Department
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Departments Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No departments found. Add your first department to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {department.code || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {department.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={department.is_active ? "default" : "secondary"}>
                          {department.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(department)}
                              title={department.is_active ? "Deactivate" : "Activate"}
                            >
                              {department.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(department)}
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
                                  <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{department.name}&quot;?
                                    This action cannot be undone. Students in this department
                                    will retain their department value.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(department)}
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
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update the department details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  placeholder="e.g., CS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Optional short code for the department (max 20 characters)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Optional description for this department"
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
