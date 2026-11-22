export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'customer'
export type PricingType = 'fixed' | 'variant' | 'enquiry'
export type ProductStatus = 'draft' | 'published' | 'archived'
export type PreferredLanguage = 'en' | 'ta'

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRole
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserRole
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          preferred_language: PreferredLanguage
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          preferred_language?: PreferredLanguage
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          preferred_language?: PreferredLanguage
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          slug: string
          name_en: string
          name_ta: string
          description_en: string | null
          description_ta: string | null
          image_path: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_en: string
          name_ta: string
          description_en?: string | null
          description_ta?: string | null
          image_path?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_en?: string
          name_ta?: string
          description_en?: string | null
          description_ta?: string | null
          image_path?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          slug: string
          sku: string
          name_en: string
          name_ta: string
          description_en: string | null
          description_ta: string | null
          material: string | null
          pricing_type: PricingType
          base_price_paise: number | null
          compare_at_price_paise: number | null
          status: ProductStatus
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          slug: string
          sku: string
          name_en: string
          name_ta: string
          description_en?: string | null
          description_ta?: string | null
          material?: string | null
          pricing_type?: PricingType
          base_price_paise?: number | null
          compare_at_price_paise?: number | null
          status?: ProductStatus
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          slug?: string
          sku?: string
          name_en?: string
          name_ta?: string
          description_en?: string | null
          description_ta?: string | null
          material?: string | null
          pricing_type?: PricingType
          base_price_paise?: number | null
          compare_at_price_paise?: number | null
          status?: ProductStatus
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          variant_sku: string
          variant_name_en: string
          variant_name_ta: string
          attributes: Json
          price_paise: number
          compare_at_price_paise: number | null
          stock_quantity: number
          weight_grams: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_sku: string
          variant_name_en: string
          variant_name_ta: string
          attributes?: Json
          price_paise: number
          compare_at_price_paise?: number | null
          stock_quantity?: number
          weight_grams?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variant_sku?: string
          variant_name_en?: string
          variant_name_ta?: string
          attributes?: Json
          price_paise?: number
          compare_at_price_paise?: number | null
          stock_quantity?: number
          weight_grams?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          storage_path: string
          alt_text_en: string | null
          alt_text_ta: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_path: string
          alt_text_en?: string | null
          alt_text_ta?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage_path?: string
          alt_text_en?: string | null
          alt_text_ta?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      store_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_user_id_fkey'
            columns: ['actor_user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      pricing_type: PricingType
      product_status: ProductStatus
    }
  }
}
