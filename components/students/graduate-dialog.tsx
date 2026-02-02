"use client";

import { useState } from "react";
import { studentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/lib/types";

interface GraduateDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GraduateDialog({
  student,
  open,
  onOpenChange,
  onSuccess,
}: GraduateDialogProps) {
  const [graduatedAt, setGraduatedAt] = useState(() => {
    // Default to today's date
    return new Date().toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await studentsApi.graduate(student.id, graduatedAt || undefined);
      toast.success(`${student.name} has been marked as graduated`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to graduate student"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setGraduatedAt(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Graduate Student
          </DialogTitle>
          <DialogDescription>
            Mark <strong>{student.name}</strong> ({student.student_id}) as graduated.
            This will change their status and prevent future borrowing.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <Alert>
            <GraduationCap className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Graduated students will no longer be able to borrow books.
              Make sure any outstanding books are returned before proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="graduated_at">Graduation Date</Label>
            <Input
              id="graduated_at"
              type="date"
              value={graduatedAt}
              onChange={(e) => setGraduatedAt(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to today if not specified.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-4 w-4" />
                Mark as Graduated
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
