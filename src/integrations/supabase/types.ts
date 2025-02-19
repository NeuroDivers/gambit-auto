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
      blocked_dates: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_services: {
        Row: {
          bundle_id: string
          created_at: string
          service_id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string
          service_id: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_services_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_services_service_id_fkey"
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
          dark_logo_url: string | null
          email: string | null
          id: string
          light_logo_url: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          company_name: string
          created_at?: string
          dark_logo_url?: string | null
          email?: string | null
          id?: string
          light_logo_url?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          company_name?: string
          created_at?: string
          dark_logo_url?: string | null
          email?: string | null
          id?: string
          light_logo_url?: string | null
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
          access_token: string | null
          address: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          address?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
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
          main_service_id: string | null
          package_id: string | null
          quantity: number
          service_id: string
          service_name: string | null
          sub_service_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          main_service_id?: string | null
          package_id?: string | null
          quantity?: number
          service_id: string
          service_name?: string | null
          sub_service_id?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          main_service_id?: string | null
          package_id?: string | null
          quantity?: number
          service_id?: string
          service_name?: string | null
          sub_service_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_items_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_items_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_main_service_id_fkey"
            columns: ["main_service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_sub_service_id_fkey"
            columns: ["sub_service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
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
          gst_amount: number
          gst_number: string | null
          id: string
          invoice_number: string
          is_archived: boolean | null
          notes: string | null
          payment_status: string
          qst_amount: number
          qst_number: string | null
          status: string
          stripe_customer_id: string | null
          subtotal: number
          total: number
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
          work_order_id: string | null
        }
        Insert: {
          client_id?: string | null
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
          gst_amount?: number
          gst_number?: string | null
          id?: string
          invoice_number: string
          is_archived?: boolean | null
          notes?: string | null
          payment_status?: string
          qst_amount?: number
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal: number
          total: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id?: string | null
        }
        Update: {
          client_id?: string | null
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
          gst_amount?: number
          gst_number?: string | null
          id?: string
          invoice_number?: string
          is_archived?: boolean | null
          notes?: string | null
          payment_status?: string
          qst_amount?: number
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
          role_id: string
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
          role_id: string
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
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          details: Json | null
          id: string
          quantity: number
          quote_id: string | null
          quote_request_id: string
          service_id: string | null
          service_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          quantity?: number
          quote_id?: string | null
          quote_request_id: string
          service_id?: string | null
          service_name: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          quantity?: number
          quote_id?: string | null
          quote_request_id?: string
          service_id?: string | null
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
          {
            foreignKeyName: "quote_items_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
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
          is_archived: boolean | null
          media_urls: string[] | null
          service_details: Json | null
          service_estimates: Json | null
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
          is_archived?: boolean | null
          media_urls?: string[] | null
          service_details?: Json | null
          service_estimates?: Json | null
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
          is_archived?: boolean | null
          media_urls?: string[] | null
          service_details?: Json | null
          service_estimates?: Json | null
          service_ids?: string[]
          status?: string
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "client_statistics"
            referencedColumns: ["email"]
          },
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
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
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
      role_permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_name: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_name: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          permission_type?: Database["public"]["Enums"]["permission_type"]
          resource_name?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          can_be_assigned_to_bay: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          nicename: string
          permissions_configured: boolean | null
          updated_at: string
        }
        Insert: {
          can_be_assigned_to_bay?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          nicename: string
          permissions_configured?: boolean | null
          updated_at?: string
        }
        Update: {
          can_be_assigned_to_bay?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          nicename?: string
          permissions_configured?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      service_bays: {
        Row: {
          assigned_profile_id: string | null
          assigned_services: string[] | null
          created_at: string
          id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["bay_status"]
          updated_at: string
        }
        Insert: {
          assigned_profile_id?: string | null
          assigned_services?: string[] | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bay_status"]
          updated_at?: string
        }
        Update: {
          assigned_profile_id?: string | null
          assigned_services?: string[] | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["bay_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_bays_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_package_id: string | null
          price: number | null
          requires_parent_service: boolean | null
          sale_price: number | null
          service_id: string
          status: Database["public"]["Enums"]["service_status"] | null
          type: Database["public"]["Enums"]["package_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_package_id?: string | null
          price?: number | null
          requires_parent_service?: boolean | null
          sale_price?: number | null
          service_id: string
          status?: Database["public"]["Enums"]["service_status"] | null
          type?: Database["public"]["Enums"]["package_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_package_id?: string | null
          price?: number | null
          requires_parent_service?: boolean | null
          sale_price?: number | null
          service_id?: string
          status?: Database["public"]["Enums"]["service_status"] | null
          type?: Database["public"]["Enums"]["package_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_parent_package_id_fkey"
            columns: ["parent_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          base_price: number | null
          can_be_standalone: boolean | null
          created_at: string
          description: string | null
          duration: number | null
          hierarchy_type:
            | Database["public"]["Enums"]["service_hierarchy_type"]
            | null
          id: string
          name: string
          parent_service_id: string | null
          price: number | null
          pricing_model:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service: boolean | null
          service_type: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          can_be_standalone?: boolean | null
          created_at?: string
          description?: string | null
          duration?: number | null
          hierarchy_type?:
            | Database["public"]["Enums"]["service_hierarchy_type"]
            | null
          id?: string
          name: string
          parent_service_id?: string | null
          price?: number | null
          pricing_model?:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service?: boolean | null
          service_type?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          can_be_standalone?: boolean | null
          created_at?: string
          description?: string | null
          duration?: number | null
          hierarchy_type?:
            | Database["public"]["Enums"]["service_hierarchy_type"]
            | null
          id?: string
          name?: string
          parent_service_id?: string | null
          price?: number | null
          pricing_model?:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service?: boolean | null
          service_type?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_parent_service_id_fkey"
            columns: ["parent_service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      site_colors: {
        Row: {
          accent_color: string
          accent_hover: string
          background: string
          button_primary: string
          button_primary_hover: string
          button_secondary: string
          button_secondary_hover: string
          created_at: string
          foreground: string
          id: string
          primary_color: string
          primary_hover: string
          theme_mode: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          accent_hover?: string
          background?: string
          button_primary?: string
          button_primary_hover?: string
          button_secondary?: string
          button_secondary_hover?: string
          created_at?: string
          foreground?: string
          id?: string
          primary_color?: string
          primary_hover?: string
          theme_mode?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          accent_hover?: string
          background?: string
          button_primary?: string
          button_primary_hover?: string
          button_secondary?: string
          button_secondary_hover?: string
          created_at?: string
          foreground?: string
          id?: string
          primary_color?: string
          primary_hover?: string
          theme_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          license_plate: string | null
          make: string
          model: string
          notes: string | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          make: string
          model: string
          notes?: string | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          make?: string
          model?: string
          notes?: string | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      vin_lookups: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          make: string | null
          model: string | null
          raw_data: Json | null
          success: boolean | null
          updated_at: string | null
          vin: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          make?: string | null
          model?: string | null
          raw_data?: Json | null
          success?: boolean | null
          updated_at?: string | null
          vin: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          make?: string | null
          model?: string | null
          raw_data?: Json | null
          success?: boolean | null
          updated_at?: string | null
          vin?: string
          year?: number | null
        }
        Relationships: []
      }
      work_order_services: {
        Row: {
          created_at: string
          id: string
          main_service_id: string | null
          quantity: number
          service_id: string
          sub_service_id: string | null
          unit_price: number
          updated_at: string
          work_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          main_service_id?: string | null
          quantity?: number
          service_id: string
          sub_service_id?: string | null
          unit_price: number
          updated_at?: string
          work_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          main_service_id?: string | null
          quantity?: number
          service_id?: string
          sub_service_id?: string | null
          unit_price?: number
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_services_main_service_id_fkey"
            columns: ["main_service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_sub_service_id_fkey"
            columns: ["sub_service_id"]
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
          assigned_profile_id: string | null
          client_id: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          created_at: string
          email: string
          end_time: string | null
          estimated_duration: unknown | null
          first_name: string
          id: string
          is_archived: boolean | null
          last_name: string
          media_url: string | null
          phone_number: string
          start_time: string | null
          status: string
          updated_at: string
          vehicle_make: string
          vehicle_model: string
          vehicle_serial: string | null
          vehicle_year: number
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          assigned_bay_id?: string | null
          assigned_profile_id?: string | null
          client_id?: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email: string
          end_time?: string | null
          estimated_duration?: unknown | null
          first_name: string
          id?: string
          is_archived?: boolean | null
          last_name: string
          media_url?: string | null
          phone_number: string
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_make: string
          vehicle_model: string
          vehicle_serial?: string | null
          vehicle_year: number
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          assigned_bay_id?: string | null
          assigned_profile_id?: string | null
          client_id?: string | null
          contact_preference?: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email?: string
          end_time?: string | null
          estimated_duration?: unknown | null
          first_name?: string
          id?: string
          is_archived?: boolean | null
          last_name?: string
          media_url?: string | null
          phone_number?: string
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_serial?: string | null
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_work_orders_assigned_bay"
            columns: ["assigned_bay_id"]
            isOneToOne: false
            referencedRelation: "service_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_orders_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "client_statistics"
            referencedColumns: ["email"]
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
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
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
      client_statistics: {
        Row: {
          email: string | null
          first_name: string | null
          id: string | null
          last_invoice_date: string | null
          last_name: string | null
          last_work_order_date: string | null
          total_invoices: number | null
          total_spent: number | null
          total_work_orders: number | null
        }
        Relationships: []
      }
      revenue_statistics: {
        Row: {
          collected_revenue: number | null
          month: string | null
          paid_invoices: number | null
          total_invoices: number | null
          total_revenue: number | null
          unpaid_invoices: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args: {
          user_id: string
          role_name: string
        }
        Returns: undefined
      }
      can_be_assigned_to_bay: {
        Args: {
          role_id: string
        }
        Returns: boolean
      }
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
      create_new_invoice: {
        Args: {
          p_work_order_id?: string
          p_customer_first_name?: string
          p_customer_last_name?: string
          p_customer_email?: string
          p_customer_phone?: string
          p_customer_address?: string
          p_vehicle_make?: string
          p_vehicle_model?: string
          p_vehicle_year?: number
          p_vehicle_vin?: string
          p_subtotal?: number
          p_tax_amount?: number
          p_total?: number
          p_notes?: string
          p_status?: string
          p_business_profile_id?: string
        }
        Returns: string
      }
      create_role: {
        Args: {
          role_name: string
          role_description?: string
        }
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }[]
      }
      has_permission: {
        Args: {
          user_id: string
          resource: string
          perm_type: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
      has_role:
        | {
            Args: {
              user_id: string
              role: Database["public"]["Enums"]["app_role"]
            }
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
              role_name: string
            }
            Returns: boolean
          }
      has_role_by_name: {
        Args: {
          user_id: string
          role_name: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      migrate_client_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reassign_users_and_delete_role: {
        Args: {
          role_id_to_delete: string
          new_role_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "sidekick" | "client"
      auto_detail_type: "interior" | "exterior" | "both"
      bay_status: "available" | "in_use" | "maintenance"
      contact_preference: "phone" | "email"
      package_type: "standalone" | "addon"
      permission_type: "page_access" | "feature_access"
      ppf_package_type:
        | "partial_front"
        | "full_front"
        | "track_pack"
        | "full_vehicle"
      quote_status: "pending" | "approved" | "rejected"
      service_hierarchy_type: "main" | "sub"
      service_pricing_model: "flat_rate" | "hourly" | "per_unit" | "variable"
      service_status: "active" | "inactive"
      tax_type: "GST" | "QST" | "HST" | "PST"
      user_role: "admin" | "technician" | "sales"
      window_tint_type: "two_front" | "front_and_rear" | "complete"
      work_order_status: "open" | "in_progress" | "completed"
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
