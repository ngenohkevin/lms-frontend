"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { invitesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, Mail, Copy, Check } from "lucide-react";
import type { StaffRole, CreateInviteRequest } from "@/lib/types";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["librarian", "admin", "staff"], "Please select a role"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ROLES: { value: StaffRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to all features",
  },
  {
    value: "librarian",
    label: "Librarian",
    description: "Can manage books, students, and transactions",
  },
  {
    value: "staff",
    label: "Staff",
    description: "Can view and check out books",
  },
];

export function InviteForm({ onSuccess, onCancel }: InviteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "librarian",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await invitesApi.create(data as CreateInviteRequest);
      // Use backend URL directly (LMS_FRONTEND_URL is configured on backend)
      // Fallback: extract path and use current origin if backend returns localhost
      let finalUrl = result.invite_url;
      if (finalUrl.includes("localhost")) {
        const url = new URL(finalUrl);
        finalUrl = window.location.origin + url.pathname;
      }
      setInviteUrl(finalUrl);
      toast.success("Invitation created!", {
        description: `An invitation has been created for ${data.email}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSendAnother = () => {
    setInviteUrl(null);
    reset();
  };

  // Success state with invite link
  if (inviteUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Invitation Created
          </CardTitle>
          <CardDescription>
            Share this link with the user to complete their account setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This link will expire in 48 hours
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSendAnother} variant="outline" className="flex-1">
              Send Another Invite
            </Button>
            {onSuccess && (
              <Button onClick={onSuccess} className="flex-1">
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invite New User
        </CardTitle>
        <CardDescription>
          Send an invitation email to add a new team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@library.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as InviteFormData["role"])}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role">
                  {selectedRole && ROLES.find(r => r.value === selectedRole)?.label}
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

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
