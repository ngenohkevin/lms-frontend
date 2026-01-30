"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { InviteForm } from "@/components/invites";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewInvitePage() {
  const router = useRouter();

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users/invites">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Send Invitation</h1>
            <p className="text-muted-foreground">
              Invite a new team member to join the library system
            </p>
          </div>
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
