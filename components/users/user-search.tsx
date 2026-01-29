"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { StaffRole } from "@/lib/types";

interface UserSearchProps {
  onSearch: (params: {
    query?: string;
    role?: StaffRole;
    active?: boolean;
  }) => void;
}

export function UserSearch({ onSearch }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<StaffRole | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const handleSearch = () => {
    onSearch({
      query: query || undefined,
      role: role === "all" ? undefined : role,
      active: status === "all" ? undefined : status === "active",
    });
  };

  const handleClear = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
    onSearch({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-full space-y-2 md:w-40">
        <label className="text-sm font-medium">Role</label>
        <Select value={role} onValueChange={(v) => setRole(v as StaffRole | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="librarian">Librarian</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-2 md:w-40">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as "all" | "active" | "inactive")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
