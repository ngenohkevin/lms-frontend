'use client';

import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto mb-4 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-muted/30">
              <Search className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              404
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 border-t pt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            You might be looking for:
          </p>
          <div className="space-y-2 text-sm">
            <Link 
              href="/dashboard" 
              className="block rounded-md px-3 py-2 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              Dashboard
            </Link>
            <Link 
              href="/books" 
              className="block rounded-md px-3 py-2 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              Books
            </Link>
            <Link 
              href="/students" 
              className="block rounded-md px-3 py-2 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: metadata is handled by layout.tsx for client components