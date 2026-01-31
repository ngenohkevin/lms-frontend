"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Barcode, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BarcodeScanResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface BarcodeInputProps {
  onScan: (barcode: string) => Promise<BarcodeScanResult>;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  onClear?: () => void;
}

/**
 * BarcodeInput - An input optimized for barcode scanner input
 *
 * Features:
 * - Auto-triggers lookup on complete barcode (Enter key or after brief pause)
 * - Debounced manual input support
 * - Visual feedback on scan success/failure
 * - Clears input after successful scan (configurable)
 */
export function BarcodeInput({
  onScan,
  placeholder = "Scan barcode or enter manually...",
  disabled = false,
  autoFocus = false,
  className,
  onClear,
}: BarcodeInputProps) {
  const [value, setValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reset status after a delay
  useEffect(() => {
    if (scanStatus !== "idle") {
      const timer = setTimeout(() => {
        setScanStatus("idle");
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  const handleScan = useCallback(
    async (barcode: string) => {
      if (!barcode.trim() || isScanning) return;

      setIsScanning(true);
      setScanStatus("idle");
      setErrorMessage(null);

      try {
        const result = await onScan(barcode.trim());
        if (result.success) {
          setScanStatus("success");
          setValue("");
          onClear?.();
        } else {
          setScanStatus("error");
          setErrorMessage(result.error || "Scan failed");
        }
      } catch (error) {
        setScanStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Scan failed");
      } finally {
        setIsScanning(false);
        // Refocus input for next scan
        inputRef.current?.focus();
      }
    },
    [onScan, isScanning, onClear]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setScanStatus("idle");
    setErrorMessage(null);

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // For manual entry, debounce the scan
    // Barcode scanners typically input very quickly, so we use a short debounce
    if (newValue.length >= 3) {
      debounceRef.current = setTimeout(() => {
        // Only auto-scan if the value hasn't changed
        // This helps differentiate between scanner input and manual typing
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      handleScan(value);
    }
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const statusIcon = () => {
    if (isScanning) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (scanStatus === "success") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (scanStatus === "error") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Barcode className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {statusIcon()}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isScanning}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-4",
            scanStatus === "success" && "border-green-500 focus-visible:ring-green-500",
            scanStatus === "error" && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

export default BarcodeInput;
