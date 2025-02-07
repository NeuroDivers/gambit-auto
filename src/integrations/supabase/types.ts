export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bay_services: {
        Row: {
          bay_id: string
          created_at: string
          is_active: boolean
          service_id: string
        }
        Insert: {
          bay_id: string
          created_at?: string
          is_active?: boolean
          service_id: string
        }
        Update: {
          bay_id?: string
          created_at?: string
          is_active?: boolean
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bay_services_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "service_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bay_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profile: {
        Row: {
          address: string | null
          business_hours: Json | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      business_taxes: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          tax_number: string
          tax_rate: number
          tax_type: Database["public"]["Enums"]["tax_type"]
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          tax_number: string
          tax_rate: number
          tax_type: Database["public"]["Enums"]["tax_type"]
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          tax_number?: string
          tax_rate?: number
          tax_type?: Database["public"]["Enums"]["tax_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_taxes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          quantity: number
          service_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          quantity?: number
          service_name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          quantity?: number
          service_name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          due_date: string | null
          gst_number: string | null
          id: string
          invoice_number: string
          notes: string | null
          payment_status: string
          qst_number: string | null
          status: string
          stripe_customer_id: string | null
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
          work_order_id: string
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          gst_number?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          payment_status?: string
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal: number
          tax_amount: number
          total: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id: string
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          gst_number?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_status?: string
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          updated_at: string
        }
        Insert: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          updated_at?: string
        }
        Update: {
          card_brand?: string
          card_exp_month?: number
          card_exp_year?: number
          card_last4?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_method_id: string | null
          status: string
          stripe_payment_intent_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          payment_method_id?: string | null
          status?: string
          stripe_payment_intent_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          payment_method_id?: string | null
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          quantity: number
          quote_id: string
          service_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          quote_id: string
          service_name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          quote_id?: string
          service_name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          client_id: string
          client_response: string | null
          created_at: string
          description: string | null
          estimated_amount: number | null
          id: string
          media_urls: string[] | null
          service_ids: string[]
          status: string
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
        }
        Insert: {
          client_id: string
          client_response?: string | null
          created_at?: string
          description?: string | null
          estimated_amount?: number | null
          id?: string
          media_urls?: string[] | null
          service_ids?: string[]
          status?: string
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Update: {
          client_id?: string
          client_response?: string | null
          created_at?: string
          description?: string | null
          estimated_amount?: number | null
          id?: string
          media_urls?: string[] | null
          service_ids?: string[]
          status?: string
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          quote_number: string
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          quote_number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          quote_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_email_fkey"
            columns: ["customer_email"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bays: {
        Row: {
          assigned_sidekick_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["bay_status"]
          updated_at: string
        }
        Insert: {
          assigned_sidekick_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bay_status"]
          updated_at?: string
        }
        Update: {
          assigned_sidekick_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bay_status"]
          updated_at?: string
        }
        Relationships: []
      }
      service_types: {
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_order_services: {
        Row: {
          created_at: string
          id: string
          quantity: number
          service_id: string
          unit_price: number
          updated_at: string
          work_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          service_id: string
          unit_price: number
          updated_at?: string
          work_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          service_id?: string
          unit_price?: number
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          additional_notes: string | null
          address: string | null
          assigned_bay_id: string | null
          assigned_sidekick_id: string | null
          client_id: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          created_at: string
          email: string
          end_time: string | null
          estimated_duration: unknown | null
          first_name: string
          id: string
          last_name: string
          media_url: string | null
          phone_number: string
          start_time: string | null
          status: string
          updated_at: string
          vehicle_make: string
          vehicle_model: string
          vehicle_serial: string
          vehicle_year: number
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          assigned_bay_id?: string | null
          assigned_sidekick_id?: string | null
          client_id?: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email: string
          end_time?: string | null
          estimated_duration?: unknown | null
          first_name: string
          id?: string
          last_name: string
          media_url?: string | null
          phone_number: string
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_make: string
          vehicle_model: string
          vehicle_serial: string
          vehicle_year: number
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          assigned_bay_id?: string | null
          assigned_sidekick_id?: string | null
          client_id?: string | null
          contact_preference?: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email?: string
          end_time?: string | null
          estimated_duration?: unknown | null
          first_name?: string
          id?: string
          last_name?: string
          media_url?: string | null
          phone_number?: string
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_serial?: string
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_assigned_bay_id_fkey"
            columns: ["assigned_bay_id"]
            isOneToOne: false
            referencedRelation: "service_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_client_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "work_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_quote_to_work_order: {
        Args: {
          input_quote_id: string
        }
        Returns: string
      }
      create_invoice_from_work_order: {
        Args: {
          work_order_id: string
        }
        Returns: string
      }
      create_user_role: {
        Args: {
          user_id: string
          role_name: string
        }
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      migrate_client_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "sidekick" | "client"
      bay_status: "available" | "in_use" | "maintenance"
      contact_preference: "phone" | "email"
      service_status: "active" | "inactive"
      tax_type: "GST" | "QST" | "HST" | "PST"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
