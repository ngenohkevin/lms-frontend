"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usersApi } from "@/lib/api";
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
import type { StaffUser, StaffUserFormData, StaffRole } from "@/lib/types";
import { toast } from "sonner";

const ROLES: { value: StaffRole; label: string; description: string }[] = [
  { value: "super_admin", label: "Super Admin", description: "Supreme authority over all users and settings" },
  { value: "admin", label: "Admin", description: "Full system access" },
  {
    value: "librarian",
    label: "Librarian",
    description: "Library management access",
  },
  { value: "staff", label: "Staff", description: "Basic staff access" },
];

const userSchemaBase = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["super_admin", "admin", "librarian", "staff"], "Please select a role"),
});

const createUserSchema = userSchemaBase.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editUserSchema = userSchemaBase.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

interface UserFormProps {
  user?: StaffUser;
  onSuccess?: (user: StaffUser) => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;
  const schema = isEditing ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          username: user.username,
          email: user.email,
          role: user.role,
          password: "",
        }
      : {
          role: "librarian",
        },
  });

  const onSubmit = async (data: StaffUserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: StaffUser;

      if (isEditing) {
        // Only include password if it was changed
        const updateData: Partial<StaffUserFormData> = {
          email: data.email,
          role: data.role,
        };
        if (data.password && data.password.length >= 8) {
          // Need to reset password via separate endpoint
          await usersApi.resetPassword(user.id, { password: data.password });
        }
        result = await usersApi.update(user.id, updateData);
        toast.success("User updated successfully");
      } else {
        result = await usersApi.create(data);
        toast.success("User created successfully");
      }

      onSuccess?.(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} user`;
      setError(message);
      toast.error(message);
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
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            placeholder="johndoe"
            {...register("username")}
            disabled={isEditing}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Username cannot be changed
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@library.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={watch("role") || ""}
            onValueChange={(value) => setValue("role", value as StaffRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role">
                {watch("role") && ROLES.find(r => r.value === watch("role"))?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value} className="py-3">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {isEditing ? "New Password" : "Password *"}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={isEditing ? "Leave blank to keep current" : "Min 8 characters"}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Only fill this if you want to change the password
            </p>
          )}
        </div>
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
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
}
