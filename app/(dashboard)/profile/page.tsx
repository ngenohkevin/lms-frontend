"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useStudentActiveTransactions } from "@/lib/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Shield,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils/format";

export default function ProfilePage() {
  const { user, isStudent } = useAuth();

  const { transactions, isLoading: transactionsLoading } =
    useStudentActiveTransactions(isStudent && user?.id ? user.id : null);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view your library activity
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
              {user.student_id && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium">{user.student_id}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={user.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user.email} disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact your librarian to update your account information.
              </p>
            </CardContent>
          </Card>

          {/* Current Borrowings (for students) */}
          {isStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Current Borrowings</CardTitle>
                <CardDescription>
                  Books you currently have checked out
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-10 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => {
                      const isOverdue =
                        tx.status === "active" &&
                        new Date(tx.due_date) < new Date();
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-4 rounded-lg border p-3"
                        >
                          <div className="h-12 w-10 rounded bg-muted flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium line-clamp-1">
                              {tx.book?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.book?.author}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`flex items-center gap-1 text-sm ${
                                isOverdue ? "text-destructive" : ""
                              }`}
                            >
                              {isOverdue ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              Due {formatDate(tx.due_date)}
                            </div>
                            {isOverdue && (
                              <Badge variant="destructive" className="mt-1">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You don&apos;t have any books checked out</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
