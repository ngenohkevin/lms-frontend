'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Calendar,
  Tag,
  User,
  Building,
  BookOpen,
  ChevronRight,
  Check,
  Search,
  Sparkles,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookSearchFilters } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  filters: BookSearchFilters;
  onFiltersChange: (filters: BookSearchFilters) => void;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

// Mock data for filter options - replace with actual data from API
const GENRE_OPTIONS: FilterOption[] = [
  { value: 'Computer Science', label: 'Computer Science', count: 45, color: 'blue' },
  { value: 'Mathematics', label: 'Mathematics', count: 32, color: 'green' },
  { value: 'Web Development', label: 'Web Development', count: 28, color: 'purple' },
  { value: 'Artificial Intelligence', label: 'AI & Machine Learning', count: 23, color: 'orange' },
  { value: 'Design', label: 'Design', count: 18, color: 'pink' },
  { value: 'Engineering', label: 'Engineering', count: 15, color: 'red' },
];

const AUTHOR_OPTIONS: FilterOption[] = [
  { value: 'John Doe', label: 'John Doe', count: 5 },
  { value: 'Jane Smith', label: 'Jane Smith', count: 3 },
  { value: 'Mike Johnson', label: 'Mike Johnson', count: 4 },
  { value: 'Sarah Wilson', label: 'Sarah Wilson', count: 6 },
  { value: 'Alex Chen', label: 'Alex Chen', count: 2 },
  { value: 'Dr. Emily Davis', label: 'Dr. Emily Davis', count: 3 },
];

const PUBLISHER_OPTIONS: FilterOption[] = [
  { value: 'Tech Publications', label: 'Tech Publications', count: 12 },
  { value: 'Engineering Press', label: 'Engineering Press', count: 8 },
  { value: 'Web Masters', label: 'Web Masters', count: 6 },
  { value: 'Algorithm Press', label: 'Algorithm Press', count: 9 },
  { value: 'Design Studio', label: 'Design Studio', count: 4 },
  { value: 'AI Publications', label: 'AI Publications', count: 7 },
];

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  count?: number;
}

function FilterSection({ 
  title, 
  icon, 
  children, 
  isExpanded = true, 
  onToggle,
  count 
}: FilterSectionProps): React.JSX.Element {
  return (
    <div className={cn(
      "space-y-2 rounded-lg transition-all duration-200",
      isExpanded && "bg-muted/20 border border-border/40 p-2"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full p-2.5 rounded-lg",
          "transition-all duration-200",
          "hover:bg-muted/30 active:scale-[0.99]",
          "group focus:outline-none focus:ring-1 focus:ring-primary/30",
          isExpanded && "bg-background/60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-md bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors">
            {icon}
          </div>
          <span className="font-medium text-sm text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-2">
              {count}
            </Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdvancedFiltersImproved({ 
  filters, 
  onFiltersChange, 
  isVisible, 
  onClose,
  className 
}: AdvancedFiltersProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState({
    availability: true,
    genre: true,
    author: false,
    publisher: false,
    year: false,
    sort: true,
  });

  const [genreSearch, setGenreSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [publisherSearch, setPublisherSearch] = useState('');

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleGenreToggle = useCallback((genreValue: string) => {
    const currentGenres = filters.genres || [];
    const newGenres = currentGenres.includes(genreValue)
      ? currentGenres.filter(g => g !== genreValue)
      : [...currentGenres, genreValue];
    
    onFiltersChange({
      ...filters,
      genres: newGenres
    });
  }, [filters, onFiltersChange]);

  const handleFilterChange = useCallback((key: keyof BookSearchFilters, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      genres: [],
      authors: [],
      publishers: [],
      years: [],
      availability: 'all',
      sort_by: 'title',
      sort_order: 'asc',
    });
  }, [onFiltersChange]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.genres && filters.genres.length > 0) count += filters.genres.length;
    if (filters.authors && filters.authors.length > 0) count += filters.authors.length;
    if (filters.publishers && filters.publishers.length > 0) count += filters.publishers.length;
    if (filters.years && filters.years.length > 0) count += filters.years.length;
    if (filters.availability !== 'all') count++;
    return count;
  }, [filters]);

  // Handle Escape key to close the panel
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return <></>;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      </AnimatePresence>

      {/* Filter Panel - Better positioned */}
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30,
          opacity: { duration: 0.3 }
        }}
        className={cn(
          "fixed right-4 top-4 bottom-4 w-80 bg-card backdrop-blur-xl",
          "rounded-xl border border-border/50 shadow-lg z-50",
          "flex flex-col overflow-hidden",
          className
        )}
      >
        {/* Enhanced Header */}
        <div className="relative p-4 border-b border-border/40 space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Advanced Filters
              </h3>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl w-9 h-9 hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Active Filters Row */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-xs px-2 py-0.5 bg-primary text-primary-foreground">
                {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs px-3 py-1.5 h-auto rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {/* Availability Filter */}
          <FilterSection
            title="Availability"
            icon={<BookOpen className="w-4 h-4" />}
            isExpanded={expandedSections.availability}
            onToggle={() => toggleSection('availability')}
            count={filters.availability !== 'all' ? 1 : 0}
          >
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Books' },
                { value: 'available', label: 'Available Now' },
                { value: 'unavailable', label: 'Currently Unavailable' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/30 cursor-pointer transition-colors group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={filters.availability === option.value}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full transition-all border flex items-center justify-center",
                      filters.availability === option.value 
                        ? "bg-primary border-primary" 
                        : "bg-muted border-border hover:bg-muted-foreground/20 group-hover:border-primary/50"
                    )}>
                      {filters.availability === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Genre Filter */}
          <FilterSection
            title="Genre"
            icon={<Tag className="w-4 h-4" />}
            isExpanded={expandedSections.genre}
            onToggle={() => toggleSection('genre')}
            count={filters.genres ? filters.genres.length : 0}
          >
            <div className="space-y-2">
              {/* Selected Genres */}
              {filters.genres && filters.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filters.genres.map((genre) => (
                    <Badge 
                      key={genre} 
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Genre Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search genres..."
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  floating={false}
                  variant="default"
                  className="pl-8 h-8 text-xs rounded-md"
                />
              </div>

              {/* Genre Options */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {GENRE_OPTIONS
                  .filter(genre => genre.label.toLowerCase().includes(genreSearch.toLowerCase()))
                  .map((genre) => (
                  <label 
                    key={genre.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.genres ? filters.genres.includes(genre.value) : false}
                          onChange={() => handleGenreToggle(genre.value)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded transition-all flex items-center justify-center border",
                          filters.genres?.includes(genre.value)
                            ? "bg-primary border-primary"
                            : "bg-muted border-border hover:bg-muted-foreground/20 group-hover:border-primary/50"
                        )}>
                          {filters.genres?.includes(genre.value) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{genre.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      {genre.count}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Author Filter */}
          <FilterSection
            title="Author"
            icon={<User className="w-4 h-4" />}
            isExpanded={expandedSections.author}
            onToggle={() => toggleSection('author')}
            count={filters.authors ? filters.authors.length : 0}
          >
            <div className="space-y-2">
              {/* Selected Authors */}
              {filters.authors && filters.authors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filters.authors.map((author) => (
                    <Badge 
                      key={author} 
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"
                      onClick={() => {
                        const newAuthors = filters.authors.filter(a => a !== author);
                        onFiltersChange({ ...filters, authors: newAuthors });
                      }}
                    >
                      {author}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  floating={false}
                  variant="default"
                  className="pl-8 h-8 text-xs rounded-md"
                />
              </div>
              
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {AUTHOR_OPTIONS
                  .filter(author => author.label.toLowerCase().includes(authorSearch.toLowerCase()))
                  .map((author) => (
                  <label 
                    key={author.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.authors ? filters.authors.includes(author.value) : false}
                          onChange={() => {
                            const currentAuthors = filters.authors || [];
                            const newAuthors = currentAuthors.includes(author.value)
                              ? currentAuthors.filter(a => a !== author.value)
                              : [...currentAuthors, author.value];
                            onFiltersChange({ ...filters, authors: newAuthors });
                          }}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded transition-all flex items-center justify-center border",
                          filters.authors?.includes(author.value)
                            ? "bg-primary border-primary"
                            : "bg-muted border-border hover:bg-muted-foreground/20 group-hover:border-primary/50"
                        )}>
                          {filters.authors?.includes(author.value) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{author.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      {author.count}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Publisher Filter */}
          <FilterSection
            title="Publisher"
            icon={<Building className="w-4 h-4" />}
            isExpanded={expandedSections.publisher}
            onToggle={() => toggleSection('publisher')}
            count={filters.publishers ? filters.publishers.length : 0}
          >
            <div className="space-y-2">
              {/* Selected Publishers */}
              {filters.publishers && filters.publishers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filters.publishers.map((publisher) => (
                    <Badge 
                      key={publisher} 
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"
                      onClick={() => {
                        const newPublishers = filters.publishers.filter(p => p !== publisher);
                        onFiltersChange({ ...filters, publishers: newPublishers });
                      }}
                    >
                      {publisher}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search publishers..."
                  value={publisherSearch}
                  onChange={(e) => setPublisherSearch(e.target.value)}
                  floating={false}
                  variant="default"
                  className="pl-8 h-8 text-xs rounded-md"
                />
              </div>
              
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {PUBLISHER_OPTIONS
                  .filter(publisher => publisher.label.toLowerCase().includes(publisherSearch.toLowerCase()))
                  .map((publisher) => (
                  <label 
                    key={publisher.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.publishers ? filters.publishers.includes(publisher.value) : false}
                          onChange={() => {
                            const currentPublishers = filters.publishers || [];
                            const newPublishers = currentPublishers.includes(publisher.value)
                              ? currentPublishers.filter(p => p !== publisher.value)
                              : [...currentPublishers, publisher.value];
                            onFiltersChange({ ...filters, publishers: newPublishers });
                          }}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded transition-all flex items-center justify-center border",
                          filters.publishers?.includes(publisher.value)
                            ? "bg-primary border-primary"
                            : "bg-muted border-border hover:bg-muted-foreground/20 group-hover:border-primary/50"
                        )}>
                          {filters.publishers?.includes(publisher.value) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{publisher.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      {publisher.count}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Publication Year Filter */}
          <FilterSection
            title="Publication Year"
            icon={<Calendar className="w-4 h-4" />}
            isExpanded={expandedSections.year}
            onToggle={() => toggleSection('year')}
            count={filters.years ? filters.years.length : 0}
          >
            <div className="space-y-2">
              {/* Selected Years */}
              {filters.years && filters.years.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filters.years.map((year) => (
                    <Badge 
                      key={year} 
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"
                      onClick={() => {
                        const newYears = filters.years.filter(y => y !== year);
                        onFiltersChange({ ...filters, years: newYears });
                      }}
                    >
                      {year}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((year) => (
                  <label 
                    key={year}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.years ? filters.years.includes(year) : false}
                          onChange={() => {
                            const currentYears = filters.years || [];
                            const newYears = currentYears.includes(year)
                              ? currentYears.filter(y => y !== year)
                              : [...currentYears, year];
                            onFiltersChange({ ...filters, years: newYears });
                          }}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded transition-all flex items-center justify-center border",
                          filters.years?.includes(year)
                            ? "bg-primary border-primary"
                            : "bg-muted border-border hover:bg-muted-foreground/20 group-hover:border-primary/50"
                        )}>
                          {filters.years?.includes(year) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{year}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Sort Options */}
          <FilterSection
            title="Sort Options"
            icon={<ArrowUpDown className="w-4 h-4" />}
            isExpanded={expandedSections.sort}
            onToggle={() => toggleSection('sort')}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Sort by</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full p-2 rounded-md border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="created_at">Date Added</option>
                  <option value="available_copies">Availability</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Order</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={filters.sort_order === 'asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('sort_order', 'asc')}
                    className={cn(
                      "h-8 text-xs justify-start",
                      filters.sort_order === 'asc' 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "hover:bg-muted/50 border-muted-foreground/50 text-foreground"
                    )}
                  >
                    <ArrowUp className="w-3 h-3 mr-1.5" />
                    Ascending
                  </Button>
                  <Button
                    variant={filters.sort_order === 'desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('sort_order', 'desc')}
                    className={cn(
                      "h-8 text-xs justify-start",
                      filters.sort_order === 'desc' 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "hover:bg-muted/50 border-muted-foreground/50 text-foreground"
                    )}
                  >
                    <ArrowDown className="w-3 h-3 mr-1.5" />
                    Descending
                  </Button>
                </div>
              </div>
            </div>
          </FilterSection>
        </div>
      </motion.div>
    </>
  );
}