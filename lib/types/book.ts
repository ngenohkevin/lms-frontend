export interface Book {
  id: string;
  book_id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  published_year?: number;
  genre?: string;
  description?: string;
  cover_image_url?: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
  is_active?: boolean;
  status?: string;
  average_rating?: number;
  total_ratings?: number;
  language?: string;
  pages?: number;
  created_at: string;
  updated_at: string;
  // New metadata fields
  category_id?: number;
  series_id?: number;
  series_number?: number;
  page_count?: number;
  edition?: string;
  format?: BookFormat;
  // Frontend convenience aliases (mapped from backend fields)
  publication_year?: number;
  category?: string;
  cover_url?: string;
  location?: string;
}

export type BookFormat = "physical" | "ebook" | "audiobook";

export interface BookFormData {
  book_id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category: string;
  description?: string;
  total_copies: number;
  location?: string;
  language?: string;
  pages?: number;
  // New metadata fields
  edition?: string;
  format?: BookFormat;
  series_id?: number | null;
  series_number?: number;
  category_id?: number;
}

export interface BookSearchParams {
  query?: string;
  category?: string;
  author?: string;
  available?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  // New filter options
  language?: string;
  format?: BookFormat;
  series_id?: number;
}

export interface BookRating {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

export interface BookRatingFormData {
  rating: number;
  review?: string;
}

export interface ISBNLookupResult {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  cover_url?: string;
  pages?: number;
  language?: string;
}

export interface BookImportData {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category: string;
  total_copies: number;
  location?: string;
}

export interface BookImportError {
  row: number;
  book_id?: string;
  field?: string;
  message: string;
  type?: string;
}

export interface BookImportSummary {
  processed_at: string;
  processing_time: string;
  file_name: string;
  file_size: number;
  duplicates_found: number;
  new_books: number;
  updated_books: number;
}

export interface BookImportResult {
  total_records: number;
  success_count: number;
  failure_count: number;
  errors?: BookImportError[];
  imported_books?: Book[];
  summary: BookImportSummary;
}

export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Science",
  "Technology",
  "Mathematics",
  "History",
  "Biography",
  "Philosophy",
  "Art",
  "Music",
  "Sports",
  "Travel",
  "Cooking",
  "Health",
  "Business",
  "Self-Help",
  "Children",
  "Young Adult",
  "Reference",
  "Textbook",
  "Other",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

// Book Copy Types
export type CopyCondition = "excellent" | "good" | "fair" | "poor" | "damaged";
export type CopyStatus = "available" | "borrowed" | "reserved" | "maintenance" | "lost" | "damaged";

export interface BookCopy {
  id: number;
  book_id: number;
  copy_number: string;
  barcode?: string;
  condition: CopyCondition;
  status: CopyStatus;
  acquisition_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookCopyFormData {
  copy_number: string;
  barcode?: string;
  condition?: CopyCondition;
  status?: CopyStatus;
  acquisition_date?: string;
  notes?: string;
}

// Author Types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorWithBooks extends Author {
  book_count: number;
  books: Book[];
}

export interface AuthorFormData {
  name: string;
  bio?: string;
}

// Series Types
export interface Series {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SeriesWithBooks extends Series {
  book_count: number;
  books: Book[];
}

export interface SeriesFormData {
  name: string;
  description?: string;
}

// Language Types (API-managed languages)
export interface Language {
  id: number;
  code: string;
  name: string;
  native_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LanguageListResponse {
  languages: Language[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface LanguageFormData {
  code: string;
  name: string;
  native_name?: string;
}

// Language constants
export const BOOK_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "sw", name: "Swahili" },
] as const;

export const BOOK_FORMATS: { value: BookFormat; label: string }[] = [
  { value: "physical", label: "Physical Book" },
  { value: "ebook", label: "E-Book" },
  { value: "audiobook", label: "Audiobook" },
];

export const COPY_CONDITIONS: { value: CopyCondition; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "damaged", label: "Damaged" },
];

export const COPY_STATUSES: { value: CopyStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "borrowed", label: "Borrowed" },
  { value: "reserved", label: "Reserved" },
  { value: "maintenance", label: "In Maintenance" },
  { value: "lost", label: "Lost" },
  { value: "damaged", label: "Damaged" },
];
