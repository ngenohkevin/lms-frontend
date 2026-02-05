"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { usePermissions } from "@/providers/permission-provider";
import { PermissionCodes } from "@/lib/types/permission";
import { useFineSettings, useUpdateFineSettings } from "@/lib/hooks/use-settings";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Banknote,
  Loader2,
  ArrowLeft,
  Save,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FineSettingsPage() {
  const router = useRouter();
  const { fineSettings, isLoading, error, mutate } = useFineSettings();
  const { update, isUpdating } = useUpdateFineSettings();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PermissionCodes.SETTINGS_FINES);

  // Form state
  const [finePerDay, setFinePerDay] = useState<string>("");
  const [lostBookFine, setLostBookFine] = useState<string>("");
  const [maxFineAmount, setMaxFineAmount] = useState<string>("");
  const [gracePeriodDays, setGracePeriodDays] = useState<string>("");
  // Initialize form with current settings
  useEffect(() => {
    if (fineSettings) {
      /* eslint-disable react-hooks/set-state-in-effect -- syncing server state to form */
      setFinePerDay(Math.round(fineSettings.fine_per_day).toString());
      setLostBookFine(Math.round(fineSettings.lost_book_fine).toString());
      setMaxFineAmount(Math.round(fineSettings.max_fine_amount).toString());
      setGracePeriodDays(fineSettings.fine_grace_period_days.toString());
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [fineSettings]);

  // Derive hasChanges from current form state vs server state
  const hasChanges = useMemo(() => {
    if (!fineSettings) return false;
    return (
      parseFloat(finePerDay) !== fineSettings.fine_per_day ||
      parseFloat(lostBookFine) !== fineSettings.lost_book_fine ||
      parseFloat(maxFineAmount) !== fineSettings.max_fine_amount ||
      parseInt(gracePeriodDays) !== fineSettings.fine_grace_period_days
    );
  }, [finePerDay, lostBookFine, maxFineAmount, gracePeriodDays, fineSettings]);

  const handleSave = async () => {
    // Validation
    const finePerDayVal = parseFloat(finePerDay);
    const lostBookFineVal = parseFloat(lostBookFine);
    const maxFineAmountVal = parseFloat(maxFineAmount);
    const gracePeriodDaysVal = parseInt(gracePeriodDays);

    if (isNaN(finePerDayVal) || finePerDayVal < 0 || finePerDayVal > 1000) {
      toast.error("Fine per day must be between KSH 0 and KSH 1,000");
      return;
    }
    if (isNaN(lostBookFineVal) || lostBookFineVal < 100 || lostBookFineVal > 50000) {
      toast.error("Lost book fine must be between KSH 100 and KSH 50,000");
      return;
    }
    if (isNaN(maxFineAmountVal) || maxFineAmountVal < 1000 || maxFineAmountVal > 100000) {
      toast.error("Maximum fine amount must be between KSH 1,000 and KSH 100,000");
      return;
    }
    if (isNaN(gracePeriodDaysVal) || gracePeriodDaysVal < 0 || gracePeriodDaysVal > 7) {
      toast.error("Grace period must be between 0 and 7 days");
      return;
    }

    const result = await update({
      fine_per_day: finePerDayVal,
      lost_book_fine: lostBookFineVal,
      max_fine_amount: maxFineAmountVal,
      fine_grace_period_days: gracePeriodDaysVal,
    });

    if (result) {
      toast.success("Fine settings updated successfully");
      mutate();
    } else {
      toast.error("Failed to update fine settings");
    }
  };

  const handleReset = () => {
    if (fineSettings) {
      setFinePerDay(Math.round(fineSettings.fine_per_day).toString());
      setLostBookFine(Math.round(fineSettings.lost_book_fine).toString());
      setMaxFineAmount(Math.round(fineSettings.max_fine_amount).toString());
      setGracePeriodDays(fineSettings.fine_grace_period_days.toString());
    }
  };

  if (error) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.FINES_VIEW}>
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
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                Failed to load fine settings. Please try again later.
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission={PermissionCodes.FINES_VIEW}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              className="-ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 mt-2">
              <Banknote className="h-6 w-6" />
              Fine Settings
            </h1>
            <p className="text-muted-foreground">
              Configure fine rates, grace periods, and maximum fine amounts
            </p>
          </div>
          <PermissionGuard permission={PermissionCodes.SETTINGS_FINES} hideWhenDenied>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isUpdating}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
              >
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </PermissionGuard>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fine Per Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Daily Overdue Fine
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Amount charged per day for overdue books</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  The amount charged for each day a book is overdue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="finePerDay">Amount (KSH 0 - 1,000)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      KSH
                    </span>
                    <Input
                      id="finePerDay"
                      type="number"
                      step="1"
                      min="0"
                      max="1000"
                      value={finePerDay}
                      onChange={(e) => setFinePerDay(e.target.value)}
                      className="pl-12"
                      disabled={!canManage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lost Book Fine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Lost Book Fine
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Default fine when a book is marked as lost</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Default fine amount when a book is reported lost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="lostBookFine">Amount (KSH 100 - 50,000)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      KSH
                    </span>
                    <Input
                      id="lostBookFine"
                      type="number"
                      step="1"
                      min="100"
                      max="50000"
                      value={lostBookFine}
                      onChange={(e) => setLostBookFine(e.target.value)}
                      className="pl-12"
                      disabled={!canManage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maximum Fine Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Maximum Fine Cap
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum fine that can accumulate per transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Maximum fine amount that can accumulate per transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="maxFineAmount">Amount (KSH 1,000 - 100,000)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      KSH
                    </span>
                    <Input
                      id="maxFineAmount"
                      type="number"
                      step="1"
                      min="1000"
                      max="100000"
                      value={maxFineAmount}
                      onChange={(e) => setMaxFineAmount(e.target.value)}
                      className="pl-12"
                      disabled={!canManage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grace Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Grace Period
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Days after due date before fines start accumulating</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Days after the due date before fines start accumulating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriodDays">Days (0-7)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    step="1"
                    min="0"
                    max="7"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                    disabled={!canManage}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info section */}
        {!canManage && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Info className="h-5 w-5" />
                <p>
                  You have view-only access to fine settings. Contact an administrator
                  to make changes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
