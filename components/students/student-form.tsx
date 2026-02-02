"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { studentsApi } from "@/lib/api";
import { useDepartments } from "@/lib/hooks/use-departments";
import { useAcademicYears } from "@/lib/hooks/use-academic-years";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Student, StudentFormData } from "@/lib/types";
import { toast } from "sonner";

const studentSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  department_id: z.number().optional(),
  year_of_study: z.number().min(1).max(10).optional(),
  max_books: z.number().min(1).max(20).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  enrollment_date: z.string().optional(),
});

type FormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student;
  onSuccess?: (student: Student) => void;
  onCancel?: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { departments, isLoading: departmentsLoading } = useDepartments();
  const { academicYears, isLoading: yearsLoading } = useAcademicYears();

  const isEditing = !!student;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? {
          student_id: student.student_id,
          first_name: student.first_name || "",
          last_name: student.last_name || "",
          email: student.email || "",
          phone: student.phone || "",
          department_id: student.department_id,
          year_of_study: student.year_of_study || 1,
          max_books: student.max_books ?? 5,
          enrollment_date: student.enrollment_date || "",
        }
      : {
          max_books: 5,
          year_of_study: 1,
        },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to API format
      const apiData: StudentFormData = {
        student_id: data.student_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        department_id: data.department_id,
        year_of_study: data.year_of_study,
        max_books: data.max_books,
        password: data.password || undefined,
        enrollment_date: data.enrollment_date || undefined,
      };

      let result: Student;

      if (isEditing) {
        result = await studentsApi.update(student.id, apiData);
        toast.success("Student updated successfully");
      } else {
        result = await studentsApi.create(apiData);
        toast.success("Student created successfully");
      }

      onSuccess?.(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} student`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="student_id">Student ID *</Label>
          <Input
            id="student_id"
            placeholder="STU-001"
            {...register("student_id")}
            disabled={isEditing}
          />
          {errors.student_id && (
            <p className="text-sm text-destructive">{errors.student_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            placeholder="John"
            {...register("first_name")}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            {...register("last_name")}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+254 700 000 000"
            {...register("phone")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          <Select
            value={watch("department_id")?.toString() || ""}
            onValueChange={(value) => setValue("department_id", value ? parseInt(value) : undefined)}
            disabled={departmentsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={departmentsLoading ? "Loading..." : "Select department"} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year_of_study">Year of Study</Label>
          <Select
            value={watch("year_of_study")?.toString() || ""}
            onValueChange={(value) => setValue("year_of_study", parseInt(value))}
            disabled={yearsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={yearsLoading ? "Loading..." : "Select year"} />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.level.toString()}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_books">Max Books Allowed</Label>
          <Input
            id="max_books"
            type="number"
            min={1}
            max={20}
            defaultValue={5}
            {...register("max_books", { valueAsNumber: true })}
          />
          {errors.max_books && (
            <p className="text-sm text-destructive">{errors.max_books.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input
            id="enrollment_date"
            type="date"
            {...register("enrollment_date")}
          />
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Student can change this after first login
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Student"
          ) : (
            "Create Student"
          )}
        </Button>
      </div>
    </form>
  );
}
