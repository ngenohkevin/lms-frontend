"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { BookCopy, BookCopyFormData } from "@/lib/types/book";
import { COPY_CONDITIONS, COPY_STATUSES } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookCopySchema = z.object({
  copy_number: z.string().min(1, "Copy number is required"),
  barcode: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair", "poor", "damaged"]).optional(),
  status: z
    .enum(["available", "borrowed", "reserved", "maintenance", "lost", "damaged"])
    .optional(),
  acquisition_date: z.string().optional().refine(
    (date) => {
      if (!date) return true;
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate <= today;
    },
    { message: "Acquisition date cannot be in the future" }
  ),
  notes: z.string().optional(),
});

type BookCopyFormValues = z.infer<typeof bookCopySchema>;

interface BookCopyFormProps {
  initialData?: BookCopy;
  onSubmit: (data: BookCopyFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function BookCopyForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: BookCopyFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookCopyFormValues>({
    resolver: zodResolver(bookCopySchema),
    defaultValues: {
      copy_number: initialData?.copy_number || "",
      barcode: initialData?.barcode || "",
      condition: initialData?.condition || "good",
      status: initialData?.status || "available",
      acquisition_date: initialData?.acquisition_date
        ? new Date(initialData.acquisition_date).toISOString().split("T")[0]
        : "",
      notes: initialData?.notes || "",
    },
  });

  const condition = watch("condition");
  const status = watch("status");

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data as BookCopyFormData);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="copy_number">Copy Number *</Label>
          <Input
            id="copy_number"
            placeholder="e.g., COPY-001"
            {...register("copy_number")}
            disabled={isSubmitting}
          />
          {errors.copy_number && (
            <p className="text-sm text-destructive">
              {errors.copy_number.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            placeholder="e.g., 9780123456789"
            {...register("barcode")}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={condition}
            onValueChange={(value) =>
              setValue("condition", value as BookCopyFormValues["condition"])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {COPY_CONDITIONS.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setValue("status", value as BookCopyFormValues["status"])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {COPY_STATUSES.map((stat) => (
                <SelectItem key={stat.value} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="acquisition_date">Acquisition Date</Label>
        <Input
          id="acquisition_date"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("acquisition_date")}
          disabled={isSubmitting}
        />
        {errors.acquisition_date ? (
          <p className="text-sm text-destructive">
            {errors.acquisition_date.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Cannot be a future date
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional notes about this copy..."
          rows={3}
          {...register("notes")}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            "Update Copy"
          ) : (
            "Add Copy"
          )}
        </Button>
      </div>
    </form>
  );
}

export default BookCopyForm;
