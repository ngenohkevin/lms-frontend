import apiClient from './client';

// Types
export interface FineSettings {
  fine_per_day: number;
  lost_book_fine: number;
  max_fine_amount: number;
  fine_grace_period_days: number;
}

export interface UpdateFineSettingsRequest {
  fine_per_day?: number;
  lost_book_fine?: number;
  max_fine_amount?: number;
  fine_grace_period_days?: number;
}

export interface SettingResponse {
  key: string;
  value: string;
  description?: string;
  category: string;
  updated_by?: number;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const SETTINGS_PREFIX = '/api/v1/settings';

// API Functions
export async function getFineSettings(): Promise<FineSettings> {
  const response = await apiClient.get<ApiResponse<FineSettings>>(`${SETTINGS_PREFIX}/fines`);
  return response.data;
}

export async function updateFineSettings(settings: UpdateFineSettingsRequest): Promise<FineSettings> {
  const response = await apiClient.put<ApiResponse<FineSettings>>(`${SETTINGS_PREFIX}/fines`, settings);
  return response.data;
}

export async function getAllSettings(): Promise<SettingResponse[]> {
  const response = await apiClient.get<ApiResponse<SettingResponse[]>>(SETTINGS_PREFIX);
  return response.data;
}

export async function getSettingsByCategory(category: string): Promise<SettingResponse[]> {
  const response = await apiClient.get<ApiResponse<SettingResponse[]>>(`${SETTINGS_PREFIX}/category/${category}`);
  return response.data;
}

export const settingsApi = {
  getFineSettings,
  updateFineSettings,
  getAllSettings,
  getSettingsByCategory,
};

export default settingsApi;
