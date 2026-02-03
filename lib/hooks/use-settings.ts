'use client';

import useSWR from 'swr';
import { useState } from 'react';
import {
  getFineSettings,
  updateFineSettings,
  getAllSettings,
  getSettingsByCategory,
  type FineSettings,
  type UpdateFineSettingsRequest,
  type SettingResponse
} from '@/lib/api/settings';

// SWR fetcher functions
const fineSettingsFetcher = () => getFineSettings();
const allSettingsFetcher = () => getAllSettings();
const categorySettingsFetcher = (category: string) => getSettingsByCategory(category);

export function useFineSettings() {
  const { data, error, isLoading, mutate } = useSWR<FineSettings>(
    'fine-settings',
    fineSettingsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    fineSettings: data,
    isLoading,
    error,
    mutate,
  };
}

export function useUpdateFineSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (settings: UpdateFineSettingsRequest): Promise<FineSettings | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateFineSettings(settings);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update fine settings');
      setError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    update,
    isUpdating,
    error,
  };
}

export function useAllSettings() {
  const { data, error, isLoading, mutate } = useSWR<SettingResponse[]>(
    'all-settings',
    allSettingsFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    settings: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useSettingsByCategory(category: string) {
  const { data, error, isLoading, mutate } = useSWR<SettingResponse[]>(
    category ? `settings-${category}` : null,
    () => categorySettingsFetcher(category),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    settings: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
