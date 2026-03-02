export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          amount: number | null
          created_at: string
          description: string
          details: Json | null
          id: string
          order_id: string | null
          restaurant_id: string
          staff_id: string | null
          staff_name: string
          staff_role: string
          type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description: string
          details?: Json | null
          id?: string
          order_id?: string | null
          restaurant_id: string
          staff_id?: string | null
          staff_name: string
          staff_role?: string
          type: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string
          details?: Json | null
          id?: string
          order_id?: string | null
          restaurant_id?: string
          staff_id?: string | null
          staff_name?: string
          staff_role?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          manager_name: string | null
          name: string
          phone: string | null
          restaurant_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name: string
          phone?: string | null
          restaurant_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          phone?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          restaurant_id: string
          sort_order: number
          type: string
        }
        Insert: {
          color?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          restaurant_id: string
          sort_order?: number
          type?: string
        }
        Update: {
          color?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          restaurant_id?: string
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summaries: {
        Row: {
          card_payments: number
          cash_payments: number
          date: string
          delivery_count: number
          dine_in_count: number
          id: string
          orders_count: number
          restaurant_id: string
          takeaway_count: number
          total_cost: number
          total_profit: number
          total_sales: number
          wallet_payments: number
        }
        Insert: {
          card_payments?: number
          cash_payments?: number
          date: string
          delivery_count?: number
          dine_in_count?: number
          id?: string
          orders_count?: number
          restaurant_id: string
          takeaway_count?: number
          total_cost?: number
          total_profit?: number
          total_sales?: number
          wallet_payments?: number
        }
        Update: {
          card_payments?: number
          cash_payments?: number
          date?: string
          delivery_count?: number
          dine_in_count?: number
          id?: string
          orders_count?: number
          restaurant_id?: string
          takeaway_count?: number
          total_cost?: number
          total_profit?: number
          total_sales?: number
          wallet_payments?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          restaurant_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          notes?: string | null
          restaurant_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_toggles: {
        Row: {
          feature_key: string
          id: string
          is_enabled: boolean
          restaurant_id: string
        }
        Insert: {
          feature_key: string
          id?: string
          is_enabled?: boolean
          restaurant_id: string
        }
        Update: {
          feature_key?: string
          id?: string
          is_enabled?: boolean
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_toggles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_programs: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string
          customer_phone: string | null
          id: string
          points: number
          restaurant_id: string
          tier: string
          total_spent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          points?: number
          restaurant_id: string
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          points?: number
          restaurant_id?: string
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_programs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          points_cost: number
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_cost?: number
          restaurant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_cost?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_id: string
          description: string
          id: string
          order_id: string | null
          points: number
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description: string
          id?: string
          order_id?: string | null
          points?: number
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          order_id?: string | null
          points?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          restaurant_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          restaurant_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          restaurant_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          applicable_products: string[] | null
          apply_to_all: boolean
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_amount: number | null
          name: string
          restaurant_id: string
          start_date: string
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          applicable_products?: string[] | null
          apply_to_all?: boolean
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_amount?: number | null
          name: string
          restaurant_id: string
          start_date?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          applicable_products?: string[] | null
          apply_to_all?: boolean
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_amount?: number | null
          name?: string
          restaurant_id?: string
          start_date?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          cost_price: number
          discount: number
          id: string
          is_prepared: boolean | null
          notes: string | null
          order_id: string
          preparation_time: number | null
          product_id: string | null
          product_name: string
          quantity: number
          tax_amount: number
          total: number
          unit_price: number
        }
        Insert: {
          cost_price?: number
          discount?: number
          id?: string
          is_prepared?: boolean | null
          notes?: string | null
          order_id: string
          preparation_time?: number | null
          product_id?: string | null
          product_name: string
          quantity?: number
          tax_amount?: number
          total?: number
          unit_price?: number
        }
        Update: {
          cost_price?: number
          discount?: number
          id?: string
          is_prepared?: boolean | null
          notes?: string | null
          order_id?: string
          preparation_time?: number | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          tax_amount?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_time: string | null
          discount: number
          discount_type: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          profit: number
          restaurant_id: string
          staff_id: string | null
          staff_name: string | null
          status: string
          subtotal: number
          table_id: string | null
          table_name: string | null
          tax_amount: number
          tax_details: Json | null
          total: number
          total_cost: number
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_time?: string | null
          discount?: number
          discount_type?: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string
          profit?: number
          restaurant_id: string
          staff_id?: string | null
          staff_name?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          table_name?: string | null
          tax_amount?: number
          tax_details?: Json | null
          total?: number
          total_cost?: number
          type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_time?: string | null
          discount?: number
          discount_type?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          profit?: number
          restaurant_id?: string
          staff_id?: string | null
          staff_name?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          table_name?: string | null
          tax_amount?: number
          tax_details?: Json | null
          total?: number
          total_cost?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          id: string
          product_id: string
          quantity_used: number
          raw_material_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity_used?: number
          raw_material_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity_used?: number
          raw_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_taxable: boolean
          min_quantity_alert: number
          name: string
          name_en: string | null
          preparation_time: number | null
          quantity: number
          restaurant_id: string
          sale_price: number
          sku: string | null
          subcategory: string | null
          type: string
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category?: string
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_taxable?: boolean
          min_quantity_alert?: number
          name: string
          name_en?: string | null
          preparation_time?: number | null
          quantity?: number
          restaurant_id: string
          sale_price?: number
          sku?: string | null
          subcategory?: string | null
          type?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_taxable?: boolean
          min_quantity_alert?: number
          name?: string
          name_en?: string | null
          preparation_time?: number | null
          quantity?: number
          restaurant_id?: string
          sale_price?: number
          sku?: string | null
          subcategory?: string | null
          type?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          min_quantity_alert: number
          name: string
          quantity: number
          restaurant_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_quantity_alert?: number
          name: string
          quantity?: number
          restaurant_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_quantity_alert?: number
          name?: string
          quantity?: number
          restaurant_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          chairs: number
          current_order_id: string | null
          id: string
          is_active: boolean
          name: string
          number: number
          occupied_at: string | null
          position_x: number
          position_y: number
          restaurant_id: string
          shape: string
          status: string
        }
        Insert: {
          chairs?: number
          current_order_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          number: number
          occupied_at?: string | null
          position_x?: number
          position_y?: number
          restaurant_id: string
          shape?: string
          status?: string
        }
        Update: {
          chairs?: number
          current_order_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          number?: number
          occupied_at?: string | null
          position_x?: number
          position_y?: number
          restaurant_id?: string
          shape?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          name_en: string | null
          owner_id: string
          phone: string | null
          receipt_footer: string | null
          settings_password: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          name_en?: string | null
          owner_id: string
          phone?: string | null
          receipt_footer?: string | null
          settings_password?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          name_en?: string | null
          owner_id?: string
          phone?: string | null
          receipt_footer?: string | null
          settings_password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_goals: {
        Row: {
          bonus: number | null
          created_at: string
          description: string | null
          id: string
          is_achieved: boolean
          period: string
          restaurant_id: string
          staff_id: string | null
          start_date: string
          target_amount: number
        }
        Insert: {
          bonus?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_achieved?: boolean
          period?: string
          restaurant_id: string
          staff_id?: string | null
          start_date?: string
          target_amount?: number
        }
        Update: {
          bonus?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_achieved?: boolean
          period?: string
          restaurant_id?: string
          staff_id?: string | null
          start_date?: string
          target_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_goals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          password_hash: string
          permissions: string[]
          restaurant_id: string
          role: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          permissions?: string[]
          restaurant_id: string
          role?: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          permissions?: string[]
          restaurant_id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          duration: number
          guest_count: number
          id: string
          notes: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status: string
          table_id: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          duration?: number
          guest_count?: number
          id?: string
          notes?: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status?: string
          table_id: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          duration?: number
          guest_count?: number
          id?: string
          notes?: string | null
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string
          status?: string
          table_id?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_settings: {
        Row: {
          applicable_categories: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          min_price_threshold: number | null
          name: string
          rate: number
          restaurant_id: string
          tax_type: string
        }
        Insert: {
          applicable_categories?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          min_price_threshold?: number | null
          name: string
          rate?: number
          restaurant_id: string
          tax_type: string
        }
        Update: {
          applicable_categories?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          min_price_threshold?: number | null
          name?: string
          rate?: number
          restaurant_id?: string
          tax_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      work_shifts: {
        Row: {
          end_time: string | null
          id: string
          is_active: boolean
          notes: string | null
          restaurant_id: string
          staff_id: string | null
          staff_name: string
          staff_role: string
          start_time: string
          total_hours: number | null
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          end_time?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          restaurant_id: string
          staff_id?: string | null
          staff_name: string
          staff_role?: string
          start_time?: string
          total_hours?: number | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          end_time?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          restaurant_id?: string
          staff_id?: string | null
          staff_name?: string
          staff_role?: string
          start_time?: string
          total_hours?: number | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_shifts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_restaurant_id: { Args: { _user_id: string }; Returns: string }
      user_belongs_to_restaurant: {
        Args: { _restaurant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
