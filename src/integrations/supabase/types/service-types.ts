
import { Json } from './json';
import { Database } from './database';

export interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number | null;
  sale_price: number | null;
  status: Database["public"]["Enums"]["service_status"];
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  price?: number | null;  // Made optional to accommodate base_price from DB
  status: Database["public"]["Enums"]["service_status"];
  updated_at: string;
  pricing_model: 'flat_rate' | 'hourly' | 'variable';
  base_price: number | null;
  parent_service_id?: string | null;
  service_type?: 'standalone' | 'sub_service' | 'bundle';
  visible_on_app?: boolean;
  visible_on_website?: boolean;
}

export interface ServiceTypesTable {
  Row: {
    created_at: string
    description: string | null
    duration: number | null
    id: string
    name: string
    price: number | null
    status: Database["public"]["Enums"]["service_status"]
    updated_at: string
    pricing_model: 'flat_rate' | 'hourly' | 'variable'
    base_price: number | null
    parent_service_id?: string | null
    service_type?: 'standalone' | 'sub_service' | 'bundle'
    visible_on_app: boolean
    visible_on_website: boolean
  }
  Insert: {
    created_at?: string
    description?: string | null
    duration?: number | null
    id?: string
    name: string
    price?: number | null
    status?: Database["public"]["Enums"]["service_status"]
    updated_at?: string
    pricing_model?: 'flat_rate' | 'hourly' | 'variable'
    base_price?: number | null
    parent_service_id?: string | null
    service_type?: 'standalone' | 'sub_service' | 'bundle'
    visible_on_app?: boolean
    visible_on_website?: boolean
  }
  Update: {
    created_at?: string
    description?: string | null
    duration?: number | null
    id?: string
    name?: string
    price?: number | null
    status?: Database["public"]["Enums"]["service_status"]
    updated_at?: string
    pricing_model?: 'flat_rate' | 'hourly' | 'variable'
    base_price?: number | null
    parent_service_id?: string | null
    service_type?: 'standalone' | 'sub_service' | 'bundle'
    visible_on_app?: boolean
    visible_on_website?: boolean
  }
  Relationships: []
}
