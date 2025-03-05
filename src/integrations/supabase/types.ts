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
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          profile_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          profile_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
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
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      commission_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          profile_id: string | null
          service_id: string | null
          status: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          profile_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          profile_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "commission_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "commission_transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_transactions_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          rate: number
          service_item_id: string | null
          staff_id: string | null
          status: string
          type: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          rate: number
          service_item_id?: string | null
          staff_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          rate?: number
          service_item_id?: string | null
          staff_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "commissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "commissions_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_history: {
        Row: {
          amount: number | null
          created_by: string | null
          customer_id: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          amount?: number | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          event_date?: string
          event_type: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          amount?: number | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "customer_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "customer_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_monthly_spending: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          month: string
          updated_at: string
          year: number
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_id: string
          id?: string
          month: string
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          month?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_monthly_spending_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_monthly_spending_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_monthly_spending_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          access_token: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_archived: boolean | null
          last_name: string
          phone_number: string | null
          postal_code: string | null
          profile_id: string | null
          state_province: string | null
          street_address: string | null
          unit_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_archived?: boolean | null
          last_name: string
          phone_number?: string | null
          postal_code?: string | null
          profile_id?: string | null
          state_province?: string | null
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_archived?: boolean | null
          last_name?: string
          phone_number?: string | null
          postal_code?: string | null
          profile_id?: string | null
          state_province?: string | null
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          created_at: string
          description: string | null
          details: Json | null
          estimate_id: string | null
          estimate_request_id: string
          id: string
          quantity: number
          service_id: string | null
          service_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: Json | null
          estimate_id?: string | null
          estimate_request_id: string
          id?: string
          quantity?: number
          service_id?: string | null
          service_name: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: Json | null
          estimate_id?: string | null
          estimate_request_id?: string
          id?: string
          quantity?: number
          service_id?: string | null
          service_name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_request_id_fkey"
            columns: ["estimate_request_id"]
            isOneToOne: false
            referencedRelation: "estimate_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_requests: {
        Row: {
          client_response: string | null
          created_at: string
          customer_id: string
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
          client_response?: string | null
          created_at?: string
          customer_id: string
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
          client_response?: string | null
          created_at?: string
          customer_id?: string
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
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "quote_requests_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_country: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_id: string | null
          customer_last_name: string | null
          customer_phone: string | null
          customer_postal_code: string | null
          customer_state_province: string | null
          customer_street_address: string | null
          customer_unit_number: string | null
          estimate_number: string
          id: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          vehicle_body_class: string | null
          vehicle_doors: number | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_trim: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          customer_state_province?: string | null
          customer_street_address?: string | null
          customer_unit_number?: string | null
          estimate_number: string
          id?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_trim?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          customer_state_province?: string | null
          customer_street_address?: string | null
          customer_unit_number?: string | null
          estimate_number?: string
          id?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_trim?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "customers"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          assigned_profile_id: string | null
          commission_rate: number | null
          commission_type: string | null
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
          assigned_profile_id?: string | null
          commission_rate?: number | null
          commission_type?: string | null
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
          assigned_profile_id?: string | null
          commission_rate?: number | null
          commission_type?: string | null
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
            foreignKeyName: "invoice_items_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "invoice_items_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
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
      invoice_snapshots: {
        Row: {
          business_data: Json
          created_at: string
          customer_data: Json
          id: string
          invoice_id: string
          vehicle_data: Json
        }
        Insert: {
          business_data: Json
          created_at?: string
          customer_data: Json
          id?: string
          invoice_id: string
          vehicle_data: Json
        }
        Update: {
          business_data?: Json
          created_at?: string
          customer_data?: Json
          id?: string
          invoice_id?: string
          vehicle_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "invoice_snapshots_invoice_id_fkey"
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
          customer_id: string | null
          customer_last_name: string | null
          customer_phone: string | null
          due_date: string | null
          gst_amount: number
          gst_number: string | null
          id: string
          invoice_number: string
          is_archived: boolean | null
          is_finalized: boolean | null
          notes: string | null
          payment_status: string
          qst_amount: number
          qst_number: string | null
          status: string
          stripe_customer_id: string | null
          subtotal: number
          total: number
          updated_at: string
          vehicle_body_class: string | null
          vehicle_doors: number | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_trim: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
          work_order_id: string | null
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
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_number?: string | null
          id?: string
          invoice_number: string
          is_archived?: boolean | null
          is_finalized?: boolean | null
          notes?: string | null
          payment_status?: string
          qst_amount?: number
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal: number
          total: number
          updated_at?: string
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_trim?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id?: string | null
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
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          gst_amount?: number
          gst_number?: string | null
          id?: string
          invoice_number?: string
          is_archived?: boolean | null
          is_finalized?: boolean | null
          notes?: string | null
          payment_status?: string
          qst_amount?: number
          qst_number?: string | null
          status?: string
          stripe_customer_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_trim?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          profile_id: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          profile_id?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          profile_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
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
          avatar_url: string | null
          bio: string | null
          calendar_settings: Json | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notification_preferences: Json | null
          phone_number: string | null
          role_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          calendar_settings?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          role_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          calendar_settings?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_preferences?: Json | null
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
          can_be_assigned_work_orders: boolean
          created_at: string
          default_dashboard: string | null
          description: string | null
          id: string
          is_protected: boolean | null
          name: string
          nicename: string
          permissions_configured: boolean | null
          updated_at: string
        }
        Insert: {
          can_be_assigned_to_bay?: boolean
          can_be_assigned_work_orders?: boolean
          created_at?: string
          default_dashboard?: string | null
          description?: string | null
          id?: string
          is_protected?: boolean | null
          name: string
          nicename: string
          permissions_configured?: boolean | null
          updated_at?: string
        }
        Update: {
          can_be_assigned_to_bay?: boolean
          can_be_assigned_work_orders?: boolean
          created_at?: string
          default_dashboard?: string | null
          description?: string | null
          id?: string
          is_protected?: boolean | null
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
          {
            foreignKeyName: "fk_service_bays_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_service_bays_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      service_commissions: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          rate: number
          service_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          rate: number
          service_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          rate?: number
          service_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_commissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_commissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "service_commissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "service_commissions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
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
      service_ratings: {
        Row: {
          assigned_profile_id: string | null
          client_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          service_id: string | null
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          assigned_profile_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          service_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          assigned_profile_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          service_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_ratings_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ratings_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "service_ratings_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "service_ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "service_ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ratings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ratings_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
          pricing_model:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service: boolean | null
          service_type: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
          visible_on_app: boolean
          visible_on_website: boolean
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
          pricing_model?:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service?: boolean | null
          service_type?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
          visible_on_app?: boolean
          visible_on_website?: boolean
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
          pricing_model?:
            | Database["public"]["Enums"]["service_pricing_model"]
            | null
          requires_main_service?: boolean | null
          service_type?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
          visible_on_app?: boolean
          visible_on_website?: boolean
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
      staff: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          department: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_date: string | null
          id: string
          is_full_time: boolean | null
          position: string | null
          postal_code: string | null
          profile_id: string
          state_province: string | null
          status: string | null
          street_address: string | null
          unit_number: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_date?: string | null
          id?: string
          is_full_time?: boolean | null
          position?: string | null
          postal_code?: string | null
          profile_id: string
          state_province?: string | null
          status?: string | null
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_date?: string | null
          id?: string
          is_full_time?: boolean | null
          position?: string | null
          postal_code?: string | null
          profile_id?: string
          state_province?: string | null
          status?: string | null
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      staff_service_skills: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_service_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_service_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "staff_service_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "staff_service_skills_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_class: string | null
          color: string | null
          created_at: string
          customer_id: string | null
          doors: number | null
          id: string
          is_primary: boolean | null
          license_plate: string | null
          make: string
          model: string
          notes: string | null
          trim: string | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          body_class?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string | null
          doors?: number | null
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          make: string
          model: string
          notes?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          body_class?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string | null
          doors?: number | null
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          make?: string
          model?: string
          notes?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
          trim: string | null
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
          trim?: string | null
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
          trim?: string | null
          updated_at?: string | null
          vin?: string
          year?: number | null
        }
        Relationships: []
      }
      work_order_requests: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          profile_id: string | null
          status: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "work_order_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "work_order_requests_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_service_status: {
        Row: {
          assigned_profile_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          progress: number | null
          service_id: string | null
          status: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          assigned_profile_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          service_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          assigned_profile_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          service_id?: string | null
          status?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_service_status_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_service_status_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "work_order_service_status_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "work_order_service_status_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_service_status_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_services: {
        Row: {
          commission_rate: number | null
          commission_type: string | null
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
          commission_rate?: number | null
          commission_type?: string | null
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
          commission_rate?: number | null
          commission_type?: string | null
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
          vehicle_body_class: string | null
          vehicle_doors: number | null
          vehicle_make: string
          vehicle_model: string
          vehicle_serial: string | null
          vehicle_trim: string | null
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
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_make: string
          vehicle_model: string
          vehicle_serial?: string | null
          vehicle_trim?: string | null
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
          vehicle_body_class?: string | null
          vehicle_doors?: number | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_serial?: string | null
          vehicle_trim?: string | null
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
            foreignKeyName: "fk_work_orders_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_work_orders_assigned_profile"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "customers"
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
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "work_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      customer_profiles: {
        Row: {
          access_token: string | null
          city: string | null
          country: string | null
          created_at: string | null
          customer_id: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          postal_code: string | null
          profile_id: string | null
          state_province: string | null
          street_address: string | null
          unit_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_commission_analytics"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "staff_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      estimate_statistics: {
        Row: {
          accepted_quotes: number | null
          draft_quotes: number | null
          pending_requests: number | null
          rejected_quotes: number | null
          sent_quotes: number | null
          total_quote_value: number | null
          total_quotes: number | null
        }
        Relationships: []
      }
      invoice_statistics: {
        Row: {
          collected_revenue: number | null
          overdue_invoices: number | null
          paid_invoices: number | null
          pending_invoices: number | null
          pending_revenue: number | null
          total_invoices: number | null
          total_revenue: number | null
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
      staff_commission_analytics: {
        Row: {
          daily_amount: number | null
          day: string | null
          first_name: string | null
          last_name: string | null
          monthly_amount: number | null
          profile_id: string | null
          weekly_amount: number | null
        }
        Relationships: []
      }
      staff_view: {
        Row: {
          department: string | null
          email: string | null
          employee_id: string | null
          employment_date: string | null
          first_name: string | null
          is_full_time: boolean | null
          last_name: string | null
          phone_number: string | null
          position: string | null
          profile_id: string | null
          role_id: string | null
          role_name: string | null
          role_nicename: string | null
          staff_id: string | null
          status: string | null
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
      work_order_statistics: {
        Row: {
          active_bays: number | null
          cancelled_work_orders: number | null
          completed_work_orders: number | null
          in_progress_work_orders: number | null
          pending_work_orders: number | null
          total_bays: number | null
          total_work_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_commission: {
        Args: {
          p_work_order_id: string
          p_invoice_id?: string
        }
        Returns: undefined
      }
      calculate_invoice_commission: {
        Args: {
          p_invoice_id: string
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
      generate_estimate_number: {
        Args: Record<PropertyKey, never>
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
