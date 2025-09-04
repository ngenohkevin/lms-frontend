import { cn } from '@/lib/utils';

interface BookCatalogSkeletonProps {
  view?: 'grid' | 'list';
  density?: 'comfortable' | 'compact' | 'spacious';
  count?: number;
  showFilters?: boolean;
}

export function BookCatalogSkeleton({
  view = 'grid',
  density = 'comfortable',
  count = 12,
  showFilters = true,
}: BookCatalogSkeletonProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search Skeleton */}
          <div className="h-10 w-80 animate-pulse rounded-lg bg-muted" />
          {/* View Toggle Skeleton */}
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex gap-2">
          {/* Filter Button Skeleton */}
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          {/* Add Button Skeleton */}
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar Skeleton */}
        {showFilters && (
          <div className="hidden w-64 space-y-4 lg:block">
            <div className="space-y-3">
              <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-24 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 w-32 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1">
          {/* Stats Bar Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>

          {/* Books Grid/List Skeleton */}
          {view === 'grid' ? (
            <div
              className={cn(
                'grid gap-6',
                density === 'compact' && 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
                density === 'comfortable' && 'grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
                density === 'spacious' && 'grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'
              )}
            >
              {Array.from({ length: count }).map((_, i) => (
                <BookCardSkeleton
                  key={i}
                  view="grid"
                  density={density}
                  delay={i * 50}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: count }).map((_, i) => (
                <BookCardSkeleton
                  key={i}
                  view="list"
                  density={density}
                  delay={i * 30}
                />
              ))}
            </div>
          )}

          {/* Pagination Skeleton */}
          <div className="mt-8 flex items-center justify-between">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookCardSkeletonProps {
  view: 'grid' | 'list';
  density: 'comfortable' | 'compact' | 'spacious';
  delay?: number;
}

function BookCardSkeleton({ view, density, delay = 0 }: BookCardSkeletonProps): React.JSX.Element {
  if (view === 'list') {
    return (
      <div
        className="animate-pulse rounded-xl border border-border bg-card p-4"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={cn(
          'flex items-center gap-4',
          density === 'compact' && 'gap-3',
          density === 'spacious' && 'gap-6'
        )}>
          {/* Cover Skeleton */}
          <div className={cn(
            'flex-shrink-0 rounded-lg bg-muted',
            density === 'compact' ? 'h-16 w-12' : 'h-20 w-16',
            density === 'spacious' && 'h-24 w-18'
          )} />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-2">
            {/* Title */}
            <div className={cn(
              'h-5 bg-muted rounded',
              density === 'compact' ? 'w-48' : 'w-56',
              density === 'spacious' && 'h-6 w-64'
            )} />
            
            {/* Author */}
            <div className="h-4 w-32 rounded bg-muted" />
            
            {/* Meta info */}
            <div className="flex items-center gap-4">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Cover Skeleton */}
      <div className={cn(
        'bg-muted',
        density === 'compact' ? 'aspect-[3/4]' : 'aspect-[2/3]',
        density === 'spacious' && 'aspect-[3/4]'
      )} />

      {/* Content Skeleton */}
      <div className={cn(
        'p-4 space-y-2',
        density === 'compact' && 'p-3 space-y-1',
        density === 'spacious' && 'p-5 space-y-3'
      )}>
        {/* Title */}
        <div className={cn(
          'h-5 bg-muted rounded',
          density === 'compact' ? 'h-4' : 'h-5',
          density === 'spacious' && 'h-6'
        )} />
        
        {/* Second line of title */}
        <div className="h-4 w-3/4 rounded bg-muted" />
        
        {/* Author */}
        <div className="h-4 w-1/2 rounded bg-muted" />

        {/* Description (if not compact) */}
        {density !== 'compact' && (
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 rounded bg-muted" />
            <div className="h-3 w-8 rounded bg-muted" />
          </div>
          <div className="h-3 w-10 rounded bg-muted" />
        </div>

        {/* Location (if spacious) */}
        {density === 'spacious' && (
          <div className="h-3 w-20 rounded bg-muted" />
        )}
      </div>
    </div>
  );
}