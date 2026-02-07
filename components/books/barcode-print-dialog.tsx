"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Printer, Loader2 } from "lucide-react";
import JsBarcode from "jsbarcode";
import { bookCopiesApi } from "@/lib/api/book-copies";
import type { BookCopy } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copies: BookCopy[];
  bookTitle?: string;
  onPrinted?: () => void;
}

export function BarcodePrintDialog({
  open,
  onOpenChange,
  copies,
  bookTitle,
  onPrinted,
}: BarcodePrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Render barcodes into SVGs when dialog opens
  useEffect(() => {
    if (!open || copies.length === 0) return;
    // Wait for DOM to render
    const timer = setTimeout(() => {
      copies.forEach((copy) => {
        const svg = document.getElementById(`barcode-preview-${copy.id}`);
        if (svg) {
          try {
            JsBarcode(svg, copy.barcode, {
              format: "CODE128",
              width: 1.5,
              height: 40,
              displayValue: true,
              fontSize: 12,
              margin: 4,
            });
          } catch {
            // Barcode rendering can fail for invalid characters
          }
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [open, copies]);

  const handlePrint = useCallback(async () => {
    if (copies.length === 0) return;
    setIsPrinting(true);

    try {
      // Generate barcode SVGs for print
      const labelHtml = copies
        .map((copy) => {
          const svgContainer = document.createElement("div");
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svgContainer.appendChild(svg);
          try {
            JsBarcode(svg, copy.barcode, {
              format: "CODE128",
              width: 2,
              height: 50,
              displayValue: true,
              fontSize: 14,
              margin: 4,
            });
          } catch {
            return "";
          }
          return `
            <div class="label">
              <div class="title">${bookTitle || ""}</div>
              ${svg.outerHTML}
            </div>
          `;
        })
        .filter(Boolean)
        .join("");

      const printWindow = window.open("", "_blank", "width=400,height=600");
      if (!printWindow) {
        toast.error("Please allow popups to print barcode labels");
        setIsPrinting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Barcode Labels</title>
          <style>
            @page {
              size: 2in 1in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 2in;
              height: 1in;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              box-sizing: border-box;
              padding: 2px 4px;
              overflow: hidden;
            }
            .label:last-child {
              page-break-after: avoid;
            }
            .title {
              font-size: 8px;
              font-weight: bold;
              text-align: center;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-bottom: 2px;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>${labelHtml}</body>
        </html>
      `);
      printWindow.document.close();

      // Wait for content to render, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      // Fallback in case onload doesn't fire
      setTimeout(() => {
        try {
          if (!printWindow.closed) {
            printWindow.print();
            printWindow.close();
          }
        } catch {
          // Window may already be closed
        }
      }, 1000);

      // Mark as printed in the API
      const copyIds = copies.map((c) => c.id);
      await bookCopiesApi.markBarcodePrinted(copyIds);
      toast.success(`Marked ${copies.length} ${copies.length === 1 ? "copy" : "copies"} as printed`);
      onPrinted?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to complete print operation");
    } finally {
      setIsPrinting(false);
    }
  }, [copies, bookTitle, onPrinted, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Barcode Labels
          </DialogTitle>
          <DialogDescription>
            {copies.length} {copies.length === 1 ? "label" : "labels"} ready to print
            {bookTitle && ` for "${bookTitle}"`}
          </DialogDescription>
        </DialogHeader>

        {/* Preview grid */}
        <div ref={previewRef} className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-3 p-1">
            {copies.map((copy) => (
              <div
                key={copy.id}
                className="border rounded-md p-2 flex flex-col items-center text-center"
              >
                {bookTitle && (
                  <p className="text-[10px] font-medium text-muted-foreground truncate w-full mb-1">
                    {bookTitle}
                  </p>
                )}
                <svg id={`barcode-preview-${copy.id}`} />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPrinting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting || copies.length === 0}
          >
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print {copies.length} {copies.length === 1 ? "Label" : "Labels"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
