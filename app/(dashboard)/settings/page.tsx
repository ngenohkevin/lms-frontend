"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings,
  Shield,
  Tags,
  ChevronRight,
} from "lucide-react";

interface SettingsLink {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const settingsLinks: SettingsLink[] = [
  {
    title: "Permissions",
    description: "Manage role-based permissions and user access controls",
    href: "/settings/permissions",
    icon: Shield,
    permission: PermissionCodes.PERMISSIONS_VIEW,
  },
  {
    title: "Book Categories",
    description: "Manage categories for organizing books in the library",
    href: "/settings/categories",
    icon: Tags,
    permission: PermissionCodes.CATEGORIES_MANAGE,
  },
];

export default function SettingsPage() {
  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage system settings and configurations
          </p>
        </div>

        {/* Settings Links */}
        <div className="grid gap-4 md:grid-cols-2">
          {settingsLinks.map((link) => {
            const content = (
              <Card key={link.href} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <Link href={link.href}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            );

            // Wrap with PermissionGuard if permission is specified
            if (link.permission) {
              return (
                <PermissionGuard key={link.href} permission={link.permission} hideWhenDenied>
                  {content}
                </PermissionGuard>
              );
            }

            return content;
          })}
        </div>
      </div>
    </AuthGuard>
  );
}
