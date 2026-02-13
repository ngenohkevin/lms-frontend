"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Users,
  ArrowLeftRight,
  Bell,
  BarChart3,
  User,
  LogOut,
  BookMarked,
  ChevronUp,
  Settings,
  Shield,
  ScanLine,
  AlertTriangle,
  DollarSign,
  BookCopy,
  Activity,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import { PermissionCodes } from "@/lib/types/permission";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils/format";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // Permission code to check (takes precedence over roles)
  roles?: ("super_admin" | "admin" | "librarian" | "staff")[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Books",
    href: "/books",
    icon: Library,
    permission: PermissionCodes.BOOKS_VIEW,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    permission: PermissionCodes.TRANSACTIONS_VIEW,
  },
  {
    title: "Reservations",
    href: "/reservations",
    icon: BookMarked,
    permission: PermissionCodes.RESERVATIONS_VIEW,
  },
];

const managementNavItems: NavItem[] = [
  {
    title: "Students",
    href: "/students",
    icon: Users,
    permission: PermissionCodes.STUDENTS_VIEW,
  },
  {
    title: "Users",
    href: "/users",
    icon: Shield,
    permission: PermissionCodes.USERS_VIEW,
  },
  {
    title: "Online Users",
    href: "/users/online",
    icon: Activity,
    permission: PermissionCodes.USERS_ONLINE,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: PermissionCodes.REPORTS_VIEW,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin", "admin", "librarian"],
  },
];

const transactionNavItems: NavItem[] = [
  {
    title: "Quick Scan",
    href: "/transactions/scan",
    icon: ScanLine,
    permission: PermissionCodes.TRANSACTIONS_BORROW,
  },
  {
    title: "Add Copies",
    href: "/books/add-copy",
    icon: BookCopy,
    permission: PermissionCodes.BOOKS_CREATE,
  },
  {
    title: "Overdue",
    href: "/transactions/overdue",
    icon: AlertTriangle,
    permission: PermissionCodes.TRANSACTIONS_VIEW,
  },
  {
    title: "Fines",
    href: "/transactions/fines",
    icon: DollarSign,
    permission: PermissionCodes.FINES_MANAGE,
  },
];

const systemNavItems: NavItem[] = [
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ScrollText,
    permission: PermissionCodes.AUDIT_LOGS_VIEW,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    permission: PermissionCodes.NOTIFICATIONS_SEND,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { setOpenMobile, isMobile } = useSidebar();

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  // Filter items based on permissions (preferred) or roles (fallback)
  const filterByAccess = (items: NavItem[]) =>
    items.filter((item) => {
      // If item has no restrictions, show it
      if (!item.permission && !item.roles) return true;

      // If permissions are still loading, hide restricted items
      if (permissionsLoading && (item.permission || item.roles)) return false;

      // Check permission first (if specified)
      if (item.permission) {
        return hasPermission(item.permission);
      }

      // Fall back to role check
      if (item.roles) {
        return hasRole(item.roles);
      }

      return true;
    });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "super_admin":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "librarian":
        return "bg-primary/10 text-primary border-primary/20";
      case "student":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">LMS</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Library System
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByAccess(mainNavItems).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.href) &&
                        "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive(item.href) && "text-primary"
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filterByAccess(transactionNavItems).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterByAccess(transactionNavItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className={cn(
                        "transition-all duration-200",
                        isActive(item.href) &&
                          "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive(item.href) && "text-primary"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filterByAccess(managementNavItems).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterByAccess(managementNavItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className={cn(
                        "transition-all duration-200",
                        isActive(item.href) &&
                          "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive(item.href) && "text-primary"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByAccess(systemNavItems).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.href) &&
                        "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive(item.href) && "text-primary"
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-muted/80 transition-colors group">
              <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.username ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0 overflow-hidden">
                <span className="font-medium text-sm truncate max-w-full text-left">
                  {user?.username || "User"}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 font-medium capitalize shrink-0",
                    getRoleBadgeColor(user?.role)
                  )}
                >
                  {user?.role === "super_admin" ? "Super Admin" : user?.role || "Unknown"}
                </Badge>
              </div>
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
