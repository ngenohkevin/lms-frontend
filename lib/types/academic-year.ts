export interface AcademicYear {
  id: number;
  name: string;
  level: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYearFormData {
  name: string;
  level: number;
  description?: string;
}

export interface AcademicYearListResponse {
  academic_years: AcademicYear[];
  total: number;
}
