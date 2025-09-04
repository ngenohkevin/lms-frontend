'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid3x3, 
  List, 
  Plus, 
  Download, 
  Upload,
  SlidersHorizontal,
  BookOpen,
  Users,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookWithStats, BookCatalogViewMode, BookSearchFilters } from '@/lib/types';
import { cn } from '@/lib/utils';

import { BookCard } from './book-card';
import { BookCatalogSkeleton } from './book-catalog-skeleton';

// Mock data for demonstration - replace with actual API calls
const MOCK_BOOKS: BookWithStats[] = [
  {
    id: 1,
    book_id: 'BK2024001',
    isbn: '978-0123456789',
    title: 'Introduction to Computer Science',
    author: 'John Doe',
    publisher: 'Tech Publications',
    published_year: 2024,
    genre: 'Computer Science',
    description: 'A comprehensive introduction to computer science concepts and programming fundamentals.',
    cover_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    total_copies: 5,
    available_copies: 3,
    shelf_location: 'CS-A1-001',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    total_borrows: 42,
    current_borrows: 2,
    waiting_list: 1,
    popularity_rank: 3,
    last_borrowed: '2024-01-10T14:30:00Z',
  },
  {
    id: 2,
    book_id: 'BK2024002',
    isbn: '978-0987654321',
    title: 'Advanced Mathematics for Engineers',
    author: 'Jane Smith',
    publisher: 'Engineering Press',
    published_year: 2023,
    genre: 'Mathematics',
    description: 'Advanced mathematical concepts and applications for engineering students.',
    cover_image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop',
    total_copies: 3,
    available_copies: 0,
    shelf_location: 'MATH-B2-012',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-12T09:15:00Z',
    updated_at: '2024-01-12T09:15:00Z',
    total_borrows: 67,
    current_borrows: 3,
    waiting_list: 4,
    popularity_rank: 1,
    last_borrowed: '2024-01-08T11:20:00Z',
  },
  {
    id: 3,
    book_id: 'BK2024003',
    isbn: '978-1122334455',
    title: 'Modern Web Development',
    author: 'Mike Johnson',
    publisher: 'Web Masters',
    published_year: 2024,
    genre: 'Web Development',
    description: 'Learn modern web development with React, Next.js, and TypeScript.',
    cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop',
    total_copies: 4,
    available_copies: 4,
    shelf_location: 'WEB-C3-007',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-20T16:45:00Z',
    updated_at: '2024-01-20T16:45:00Z',
    total_borrows: 23,
    current_borrows: 0,
    waiting_list: 0,
    popularity_rank: 8,
    last_borrowed: '2024-01-05T13:10:00Z',
  },
  {
    id: 4,
    book_id: 'BK2024004',
    isbn: '978-5566778899',
    title: 'Data Structures and Algorithms',
    author: 'Sarah Wilson',
    publisher: 'Algorithm Press',
    published_year: 2023,
    genre: 'Computer Science',
    description: 'Comprehensive guide to data structures and algorithm design patterns.',
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    total_copies: 6,
    available_copies: 2,
    shelf_location: 'CS-A1-045',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-18T12:30:00Z',
    updated_at: '2024-01-18T12:30:00Z',
    total_borrows: 89,
    current_borrows: 4,
    waiting_list: 2,
    popularity_rank: 2,
    last_borrowed: '2024-01-09T15:45:00Z',
  },
  {
    id: 5,
    book_id: 'BK2024005',
    isbn: '978-9988776655',
    title: 'Digital Design Principles',
    author: 'Alex Chen',
    publisher: 'Design Studio',
    published_year: 2024,
    genre: 'Design',
    description: 'Modern principles of digital design and user experience.',
    cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    total_copies: 2,
    available_copies: 1,
    shelf_location: 'DES-D4-023',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-25T14:20:00Z',
    updated_at: '2024-01-25T14:20:00Z',
    total_borrows: 31,
    current_borrows: 1,
    waiting_list: 0,
    popularity_rank: 12,
    last_borrowed: '2024-01-07T10:30:00Z',
  },
  {
    id: 6,
    book_id: 'BK2024006',
    isbn: '978-3344556677',
    title: 'Machine Learning Fundamentals',
    author: 'Dr. Emily Davis',
    publisher: 'AI Publications',
    published_year: 2023,
    genre: 'Artificial Intelligence',
    description: 'Introduction to machine learning algorithms and applications.',
    cover_image_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=600&fit=crop',
    total_copies: 7,
    available_copies: 5,
    shelf_location: 'AI-E5-089',
    is_active: true,
    deleted_at: null,
    created_at: '2024-01-22T08:45:00Z',
    updated_at: '2024-01-22T08:45:00Z',
    total_borrows: 54,
    current_borrows: 2,
    waiting_list: 1,
    popularity_rank: 5,
    last_borrowed: '2024-01-06T16:15:00Z',
  }
];

export function BookCatalog(): React.JSX.Element {
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<BookCatalogViewMode>({
    view: 'grid',
    density: 'comfortable',
    show_covers: true,
    cards_per_row: 4,
  });
  
  const [filters, setFilters] = useState<BookSearchFilters>({
    genres: [],
    authors: [],
    publishers: [],
    years: [],
    availability: 'all',
    sort_by: 'title',
    sort_order: 'asc',
  });

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let books = MOCK_BOOKS;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre?.toLowerCase().includes(query) ??
        book.book_id.toLowerCase().includes(query) ??
        book.isbn?.toLowerCase().includes(query)
      );
    }

    // Availability filter
    if (filters.availability === 'available') {
      books = books.filter(book => book.available_copies > 0);
    } else if (filters.availability === 'unavailable') {
      books = books.filter(book => book.available_copies === 0);
    }

    // Sort books
    books.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;
      
      switch (filters.sort_by) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'author':
          aVal = a.author.toLowerCase();
          bVal = b.author.toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'available_copies':
          aVal = a.available_copies;
          bVal = b.available_copies;
          break;
        default:
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
      }

      if (aVal < bVal) return filters.sort_order === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sort_order === 'asc' ? 1 : -1;
      return 0;
    });

    return books;
  }, [searchQuery, filters]);

  const stats = useMemo(() => {
    return {
      total: MOCK_BOOKS.length,
      available: MOCK_BOOKS.filter(book => book.available_copies > 0).length,
      borrowed: MOCK_BOOKS.reduce((sum, book) => sum + book.current_borrows, 0),
      popular: MOCK_BOOKS.filter(book => book.popularity_rank && book.popularity_rank <= 10).length,
    };
  }, []);

  const handleBookView = (book: BookWithStats): void => {
    // TODO: Implement book detail view
    void book;
  };

  const handleBookEdit = (book: BookWithStats): void => {
    // TODO: Implement book edit form
    void book;
  };

  const handleBookDelete = (book: BookWithStats): void => {
    // TODO: Implement book deletion
    void book;
  };

  const handleBookFavorite = (book: BookWithStats): void => {
    // TODO: Implement book favorites
    void book;
  };

  const handleBookShare = (book: BookWithStats): void => {
    // TODO: Implement book sharing
    void book;
  };

  if (isLoading) {
    return <BookCatalogSkeleton view={viewMode.view === 'table' ? 'list' : viewMode.view} density={viewMode.density} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="space-y-4">
        {/* Search and View Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
            <Input
              placeholder="Search books, authors, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-border/30 bg-card p-0.5 shadow-sm w-fit">
            <Button
              variant={viewMode.view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(prev => ({ ...prev, view: 'grid' }))}
              className={cn(
                "h-8 px-2.5 transition-colors rounded-md",
                viewMode.view !== 'grid' && "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode.view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(prev => ({ ...prev, view: 'list' }))}
              className={cn(
                "h-8 px-2.5 transition-colors rounded-md",
                viewMode.view !== 'list' && "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">List</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2">
          {/* Filters Toggle */}
          <Button
            variant={showFilters ? 'default' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 transition-colors font-medium shadow-sm border border-border/20"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          {/* Action Buttons - Hide text on mobile */}
          <Button 
            variant="secondary" 
            className="gap-2 transition-colors font-medium shadow-sm border border-border/20"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button 
            variant="secondary" 
            className="gap-2 transition-colors font-medium shadow-sm border border-border/20"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button className="gap-2 transition-colors font-medium shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Book</span>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {filteredBooks.length} of {stats.total} books
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {stats.borrowed} borrowed
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {stats.popular} popular
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {stats.available} available
          </Badge>
          {searchQuery && (
            <Badge variant="outline" className="max-w-[200px] truncate">
              Search: &quot;{searchQuery}&quot;
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filters - Full width on mobile */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              className="block lg:hidden overflow-hidden"
            >
              <div className="w-full space-y-4 rounded-lg border border-border/10 bg-card/95 backdrop-blur-sm p-4 shadow-lg mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      genres: [],
                      authors: [],
                      publishers: [],
                      years: [],
                      availability: 'all',
                      sort_by: 'title',
                      sort_order: 'asc',
                    })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>

                {/* Availability Filter */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Availability</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'all', label: 'All Books' },
                      { value: 'available', label: 'Available' },
                      { value: 'unavailable', label: 'Unavailable' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-md p-1 -m-1 transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={filters.availability === option.value}
                            onChange={(e) => setFilters(prev => ({ 
                              ...prev, 
                              availability: e.target.value as 'all' | 'available' | 'unavailable'
                            }))}
                            className="sr-only"
                          />
                          <div className={cn(
                            "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                            filters.availability === option.value
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40 bg-background hover:border-primary"
                          )}>
                            {filters.availability === option.value && (
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Sort by</h4>
                  <div className="relative">
                    <select
                      value={filters.sort_by}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        sort_by: e.target.value as 'title' | 'author' | 'created_at' | 'available_copies'
                      }))}
                      className="w-full rounded-md border border-border/40 bg-card text-card-foreground px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none shadow-sm hover:border-muted-foreground"
                    >
                      <option value="title">Title</option>
                      <option value="author">Author</option>
                      <option value="created_at">Date Added</option>
                      <option value="available_copies">Availability</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={filters.sort_order === 'asc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, sort_order: 'asc' }))}
                      className={cn(
                        "flex-1 transition-all font-medium",
                        filters.sort_order !== 'asc' && "border-muted-foreground/50 text-foreground hover:border-primary hover:bg-accent/50"
                      )}
                    >
                      A-Z
                    </Button>
                    <Button
                      variant={filters.sort_order === 'desc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, sort_order: 'desc' }))}
                      className={cn(
                        "flex-1 transition-all font-medium",
                        filters.sort_order !== 'desc' && "border-muted-foreground/50 text-foreground hover:border-primary hover:bg-accent/50"
                      )}
                    >
                      Z-A
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters - Sidebar on desktop */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              className="hidden lg:block overflow-hidden"
            >
              <div className="w-64 space-y-4 rounded-lg border border-border/10 bg-card/95 backdrop-blur-sm p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      genres: [],
                      authors: [],
                      publishers: [],
                      years: [],
                      availability: 'all',
                      sort_by: 'title',
                      sort_order: 'asc',
                    })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>

                {/* Availability Filter */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Availability</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'all', label: 'All Books' },
                      { value: 'available', label: 'Available' },
                      { value: 'unavailable', label: 'Unavailable' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-md p-1 -m-1 transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={filters.availability === option.value}
                            onChange={(e) => setFilters(prev => ({ 
                              ...prev, 
                              availability: e.target.value as 'all' | 'available' | 'unavailable'
                            }))}
                            className="sr-only"
                          />
                          <div className={cn(
                            "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                            filters.availability === option.value
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40 bg-background hover:border-primary"
                          )}>
                            {filters.availability === option.value && (
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Sort by</h4>
                  <div className="relative">
                    <select
                      value={filters.sort_by}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        sort_by: e.target.value as 'title' | 'author' | 'created_at' | 'available_copies'
                      }))}
                      className="w-full rounded-md border border-border/40 bg-card text-card-foreground px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none shadow-sm hover:border-muted-foreground"
                    >
                      <option value="title">Title</option>
                      <option value="author">Author</option>
                      <option value="created_at">Date Added</option>
                      <option value="available_copies">Availability</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={filters.sort_order === 'asc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, sort_order: 'asc' }))}
                      className={cn(
                        "flex-1 transition-all font-medium",
                        filters.sort_order !== 'asc' && "border-muted-foreground/50 text-foreground hover:border-primary hover:bg-accent/50"
                      )}
                    >
                      A-Z
                    </Button>
                    <Button
                      variant={filters.sort_order === 'desc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, sort_order: 'desc' }))}
                      className={cn(
                        "flex-1 transition-all font-medium",
                        filters.sort_order !== 'desc' && "border-muted-foreground/50 text-foreground hover:border-primary hover:bg-accent/50"
                      )}
                    >
                      Z-A
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Content */}
        <div className="flex-1">
          {filteredBooks.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No books found</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {searchQuery ? 
                  `No books match your search "${searchQuery}"` :
                  'Try adjusting your filters or add some books to get started'
                }
              </p>
            </div>
          ) : viewMode.view === 'grid' ? (
            <motion.div
              layout
              className={cn(
                'grid',
                viewMode.density === 'compact' && 'grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
                viewMode.density === 'comfortable' && 'grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
                viewMode.density === 'spacious' && 'grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'
              )}
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: [0.19, 1, 0.22, 1]
                  }}
                >
                  <BookCard
                    book={book}
                    view="grid"
                    density={viewMode.density}
                    showCovers={viewMode.show_covers}
                    onView={handleBookView}
                    onEdit={handleBookEdit}
                    onDelete={handleBookDelete}
                    onFavorite={handleBookFavorite}
                    onShare={handleBookShare}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.03,
                    ease: [0.19, 1, 0.22, 1]
                  }}
                >
                  <BookCard
                    book={book}
                    view="list"
                    density={viewMode.density}
                    showCovers={viewMode.show_covers}
                    onView={handleBookView}
                    onEdit={handleBookEdit}
                    onDelete={handleBookDelete}
                    onFavorite={handleBookFavorite}
                    onShare={handleBookShare}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}