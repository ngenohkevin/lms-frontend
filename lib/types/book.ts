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
  // Frontend convenience aliases (mapped from backend fields)
  publication_year?: number;
  category?: string;
  cover_url?: string;
  location?: string;
}

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

export interface BookImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    isbn: string;
    error: string;
  }>;
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
