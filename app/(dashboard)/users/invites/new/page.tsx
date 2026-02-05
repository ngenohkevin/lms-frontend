"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { InviteForm } from "@/components/invites";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewInvitePage() {
  const router = useRouter();

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            className="-ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-3xl font-bold tracking-tight mt-2">Send Invitation</h1>
          <p className="text-muted-foreground">
            Invite a new team member to join the library system
          </p>
        </div>

        <div className="max-w-lg">
          <InviteForm
            onSuccess={() => router.push("/users/invites")}
            onCancel={() => router.push("/users/invites")}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
