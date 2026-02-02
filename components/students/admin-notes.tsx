"use client";

import { useState } from "react";
import { studentsApi } from "@/lib/api";
import { usePermissions } from "@/providers/permission-provider";
import { PermissionCodes } from "@/lib/types/permission";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/lib/types";

interface AdminNotesProps {
  student: Student;
  onUpdate?: (student: Student) => void;
}

export function AdminNotes({ student, onUpdate }: AdminNotesProps) {
  const { hasPermission } = usePermissions();
  const canManageNotes = hasPermission(PermissionCodes.STUDENTS_ADMIN_NOTES);

  const [notes, setNotes] = useState(student.admin_notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Don't render if user doesn't have permission to view or manage admin notes
  if (!canManageNotes) {
    return null;
  }

  const hasChanges = notes !== (student.admin_notes || "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedStudent = await studentsApi.updateAdminNotes(student.id, notes);
      toast.success("Admin notes saved successfully");
      setIsEditing(false);
      onUpdate?.(updatedStudent);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save admin notes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(student.admin_notes || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Admin Notes
          <Lock className="h-3 w-3 text-muted-foreground ml-1" />
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          Internal notes visible only to authorized staff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="admin_notes" className="sr-only">
                Admin Notes
              </Label>
              <Textarea
                id="admin_notes"
                placeholder="Add internal notes about this student..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={isSaving}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {notes ? (
              <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                {notes}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No admin notes recorded for this student.
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                {notes ? "Edit Notes" : "Add Notes"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
