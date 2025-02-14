

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
  }
  Relationships: []
}

