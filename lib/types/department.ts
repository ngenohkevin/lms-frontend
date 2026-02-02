export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  name: string;
  code?: string;
  description?: string;
}

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
}
