'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Calendar,
  Tag,
  User,
  Building,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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

const YEAR_OPTIONS: FilterOption[] = [
  { value: '2024', label: '2024', count: 25 },
  { value: '2023', label: '2023', count: 35 },
  { value: '2022', label: '2022', count: 18 },
  { value: '2021', label: '2021', count: 12 },
  { value: '2020', label: '2020', count: 8 },
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
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full p-2 rounded-lg",
          "transition-all duration-200",
          "hover:bg-accent hover:bg-opacity-70 group",
          "focus:outline-none focus:ring-2 focus:ring-primary/20"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          "group-hover:text-foreground",
          !isExpanded && "-rotate-90"
        )} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MultiSelectFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
  maxDisplay?: number;
}

function MultiSelectFilter({ 
  options, 
  selectedValues, 
  onSelectionChange,
  searchable = true,
  placeholder = "Search...",
  maxDisplay = 5
}: MultiSelectFilterProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  const filteredOptions = useMemo(() => {
    const filtered = searchTerm 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;
    
    return showAll ? filtered : filtered.slice(0, maxDisplay);
  }, [options, searchTerm, showAll, maxDisplay]);

  const toggleOption = useCallback((value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  }, [selectedValues, onSelectionChange]);

  const hasMore = !showAll && options.length > maxDisplay;

  return (
    <div className="space-y-3">
      {searchable && options.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="pl-7 h-8 text-xs bg-background border-border"
          />
        </div>
      )}
      
      <div className="space-y-1">
        {filteredOptions.map((option) => (
          <motion.label
            key={option.value}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer",
              "transition-all duration-200",
              "hover:bg-accent hover:bg-opacity-50",
              selectedValues.includes(option.value) && "bg-primary/10 border border-primary/20"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="sr-only"
                />
                <div className={cn(
                  "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                  selectedValues.includes(option.value)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40 hover:border-primary"
                )}>
                  {selectedValues.includes(option.value) && (
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  )}
                </div>
              </div>
              <span className="text-sm text-foreground truncate flex-1">
                {option.label}
              </span>
            </div>
            
            {option.count !== undefined && (
              <span className="text-xs text-muted-foreground font-mono">
                {option.count}
              </span>
            )}
          </motion.label>
        ))}
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="w-full mt-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Show {options.length - maxDisplay} more...
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdvancedFilters({ 
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

  // Handle Escape key to close the panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isVisible, onClose]);

  const toggleSection = (section: keyof typeof expandedSections): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = (): void => {
    onFiltersChange({
      genres: [],
      authors: [],
      publishers: [],
      years: [],
      availability: 'all',
      sort_by: 'title',
      sort_order: 'asc',
    });
  };

  const activeFilterCount = useMemo(() => {
    return (
      (filters.genres?.length || 0) +
      (filters.authors?.length || 0) +
      (filters.publishers?.length || 0) +
      (filters.years?.length || 0) +
      (filters.availability !== 'all' ? 1 : 0)
    );
  }, [filters]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
          
          {/* Filter Panel */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
              "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
              "w-80 lg:w-64 shrink-0",
              "bg-card backdrop-blur-xl border-r border-border",
              "shadow-2xl lg:shadow-lg",
              "overflow-y-auto",
              className
            )}
          >
            <div className="p-4 space-y-6 h-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Advanced Filters</h3>
                    {activeFilterCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Active Filters
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {filters.availability !== 'all' && (
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-2 py-1 capitalize"
                      >
                        {filters.availability}
                      </Badge>
                    )}
                    {[...filters.genres, ...filters.authors, ...filters.publishers, ...filters.years.map(String)].map(filter => (
                      <Badge 
                        key={filter}
                        variant="secondary" 
                        className="text-[10px] px-2 py-1 max-w-20 truncate"
                      >
                        {filter}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Availability Filter */}
              <FilterSection
                title="Availability"
                icon={<BookOpen className="h-4 w-4 text-blue-500" />}
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
                    <label 
                      key={option.value} 
                      className={cn(
                        "flex items-center gap-2 cursor-pointer p-2 rounded-md",
                        "transition-all duration-200",
                        "hover:bg-accent hover:bg-opacity-50",
                        filters.availability === option.value && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={filters.availability === option.value}
                          onChange={(e) => onFiltersChange({ 
                            ...filters, 
                            availability: e.target.value as 'all' | 'available' | 'unavailable'
                          })}
                          className="sr-only"
                        />
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                          filters.availability === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40 hover:border-primary"
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
              </FilterSection>

              <Separator />

              {/* Genre Filter */}
              <FilterSection
                title="Genre"
                icon={<Tag className="h-4 w-4 text-purple-500" />}
                isExpanded={expandedSections.genre}
                onToggle={() => toggleSection('genre')}
                count={filters.genres.length}
              >
                <MultiSelectFilter
                  options={GENRE_OPTIONS}
                  selectedValues={filters.genres}
                  onSelectionChange={(genres) => onFiltersChange({ ...filters, genres })}
                  placeholder="Search genres..."
                />
              </FilterSection>

              <Separator />

              {/* Author Filter */}
              <FilterSection
                title="Author"
                icon={<User className="h-4 w-4 text-green-500" />}
                isExpanded={expandedSections.author}
                onToggle={() => toggleSection('author')}
                count={filters.authors.length}
              >
                <MultiSelectFilter
                  options={AUTHOR_OPTIONS}
                  selectedValues={filters.authors}
                  onSelectionChange={(authors) => onFiltersChange({ ...filters, authors })}
                  placeholder="Search authors..."
                />
              </FilterSection>

              <Separator />

              {/* Publisher Filter */}
              <FilterSection
                title="Publisher"
                icon={<Building className="h-4 w-4 text-orange-500" />}
                isExpanded={expandedSections.publisher}
                onToggle={() => toggleSection('publisher')}
                count={filters.publishers.length}
              >
                <MultiSelectFilter
                  options={PUBLISHER_OPTIONS}
                  selectedValues={filters.publishers}
                  onSelectionChange={(publishers) => onFiltersChange({ ...filters, publishers })}
                  placeholder="Search publishers..."
                />
              </FilterSection>

              <Separator />

              {/* Year Filter */}
              <FilterSection
                title="Publication Year"
                icon={<Calendar className="h-4 w-4 text-red-500" />}
                isExpanded={expandedSections.year}
                onToggle={() => toggleSection('year')}
                count={filters.years.length}
              >
                <MultiSelectFilter
                  options={YEAR_OPTIONS}
                  selectedValues={filters.years.map(String)}
                  onSelectionChange={(years) => onFiltersChange({ 
                    ...filters, 
                    years: years.map(Number) 
                  })}
                  searchable={false}
                />
              </FilterSection>

              <Separator />

              {/* Sort Options */}
              <FilterSection
                title="Sort Options"
                icon={<Sparkles className="h-4 w-4 text-pink-500" />}
                isExpanded={expandedSections.sort}
                onToggle={() => toggleSection('sort')}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Sort by
                    </label>
                    <div className="relative">
                      <select
                        value={filters.sort_by}
                        onChange={(e) => onFiltersChange({ 
                          ...filters, 
                          sort_by: e.target.value as 'title' | 'author' | 'created_at' | 'available_copies'
                        })}
                        className={cn(
                          "w-full rounded-md border border-border bg-background text-foreground",
                          "px-3 py-2 pr-8 text-sm transition-all appearance-none",
                          "focus:ring-2 focus:ring-primary focus:border-primary",
                          "hover:border-muted-foreground"
                        )}
                      >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="created_at">Date Added</option>
                        <option value="available_copies">Availability</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Order
                    </label>
                    <div className="flex gap-1">
                      <Button
                        variant={filters.sort_order === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, sort_order: 'asc' })}
                        className="flex-1 h-8 text-xs"
                      >
                        Ascending
                      </Button>
                      <Button
                        variant={filters.sort_order === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, sort_order: 'desc' })}
                        className="flex-1 h-8 text-xs"
                      >
                        Descending
                      </Button>
                    </div>
                  </div>
                </div>
              </FilterSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}