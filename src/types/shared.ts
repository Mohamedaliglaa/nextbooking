// types/shared.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface TimeOption {
  value: 'now' | 'scheduled';
  label: string;
  icon: string;
}

export interface PaymentOption {
  value: 'cash' | 'credit_card';
  label: string;
  description: string;
  icon: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}