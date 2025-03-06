
// Additional interfaces to resolve the type errors
export interface ServiceFormData {
  service_type: string;
  quantity?: number;
  details?: Record<string, any>;
  images?: string[];
}
