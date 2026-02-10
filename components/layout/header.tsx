"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Moon, Sun, BookOpen, Users, FileText, CalendarDays, BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";
import { notificationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLibrarian } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This pattern is necessary for SSR hydration with theme-related rendering
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const { count } = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Ignore errors
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
    setCommandOpen(false);
    setSearchValue("");
  }, [router]);

  const handleSearch = useCallback(() => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return;

    // Navigate to books page with search query
    router.push(`/books?search=${encodeURIComponent(trimmedValue)}`);
    setCommandOpen(false);
    setSearchValue("");
  }, [searchValue, router]);

  // Handle keyboard events in command input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses Enter and there's a search value, search for it
    if (e.key === "Enter" && searchValue.trim()) {
      e.preventDefault();
      handleSearch();
    }
  }, [searchValue, handleSearch]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />

        <div className="flex flex-1 items-center gap-4">
          <Button
            variant="outline"
            className="hidden w-full max-w-sm justify-start text-muted-foreground md:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9 md:hidden"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-9 sm:w-9">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" asChild className="relative h-10 w-10 sm:h-9 sm:w-9">
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
        </div>
      </header>

      <CommandDialog
        open={commandOpen}
        onOpenChange={(open) => {
          setCommandOpen(open);
          if (!open) setSearchValue("");
        }}
      >
        <CommandInput
          placeholder="Search books, students, or type a command..."
          value={searchValue}
          onValueChange={setSearchValue}
          onKeyDown={handleKeyDown}
        />
        <CommandList>
          <CommandEmpty>
            {searchValue.trim() ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to search for &quot;{searchValue}&quot;
                </p>
              </div>
            ) : (
              "Type to search or select a quick action..."
            )}
          </CommandEmpty>
          {searchValue.trim() && (
            <CommandGroup heading="Search">
              <CommandItem onSelect={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search for &quot;{searchValue}&quot;
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleNavigation("/books")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse All Books
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/transactions")}>
              <FileText className="mr-2 h-4 w-4" />
              View Transactions
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/reservations")}>
              <CalendarDays className="mr-2 h-4 w-4" />
              View Reservations
            </CommandItem>
            {isLibrarian && (
              <>
                <CommandItem onSelect={() => handleNavigation("/students")}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/reports")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </CommandItem>
              </>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
