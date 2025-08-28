'use client'

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen, Users, BarChart3, Settings, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Premium Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold text-gradient">
              Library Management System
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="container py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface/50 px-3 py-1 text-sm backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-accent" />
              <span className="text-text-secondary">Premium macOS-Inspired Design</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-text-primary">
              Modern Library
              <span className="text-gradient"> Management</span>
            </h1>
            
            <p className="mb-12 text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              A comprehensive, elegant solution for managing books, students, and transactions 
              with a beautiful macOS-inspired interface and powerful features.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center items-center flex-col sm:flex-row mb-16">
              <Button 
                size="lg" 
                className="btn-primary hover-lift press-scale focus-ring shadow-button"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="hover-lift press-scale focus-ring"
              >
                View Documentation
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="group hover-lift transition-all duration-300">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">Book Management</h3>
                <p className="text-sm text-text-secondary">
                  Comprehensive catalog with advanced search, categories, and availability tracking
                </p>
              </div>
            </GlassCard>

            <GlassCard className="group hover-lift transition-all duration-300">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">Student Management</h3>
                <p className="text-sm text-text-secondary">
                  Organize students by year with bulk import and easy account creation
                </p>
              </div>
            </GlassCard>

            <GlassCard className="group hover-lift transition-all duration-300">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">Analytics & Reports</h3>
                <p className="text-sm text-text-secondary">
                  Year-based reporting with visual dashboards and exportable data
                </p>
              </div>
            </GlassCard>

            <GlassCard className="group hover-lift transition-all duration-300">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Settings className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">Advanced Features</h3>
                <p className="text-sm text-text-secondary">
                  Notifications, reservations, fine management, and audit logging
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Status Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success-light px-4 py-2 text-sm text-success">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              Phase 1.2 Implementation - Design System Active
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
