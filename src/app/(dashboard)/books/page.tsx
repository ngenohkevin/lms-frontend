import { Metadata } from 'next';
import { Suspense } from 'react';

import { BookCatalog } from '@/components/books/book-catalog';
import { BookCatalogSkeleton } from '@/components/books/book-catalog-skeleton';

export const metadata: Metadata = {
  title: 'Books | Library Management System',
  description: 'Browse and manage the book catalog with advanced search and filtering.',
  openGraph: {
    title: 'Books | Library Management System',
    description: 'Browse and manage the book catalog with advanced search and filtering.',
  },
};

export default function BooksPage(): React.JSX.Element {
  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Book Catalog
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Browse, search, and manage your library&apos;s book collection
          </p>
        </div>
      </div>

      <Suspense fallback={<BookCatalogSkeleton />}>
        <BookCatalog />
      </Suspense>
    </div>
  );
}