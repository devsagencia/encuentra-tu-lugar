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
      moderation_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          moderator_id: string | null
          profile_id: string
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          profile_id: string
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_stats: {
        Row: {
          contacts: number | null
          id: string
          profile_id: string
          view_date: string
          views: number | null
        }
        Insert: {
          contacts?: number | null
          id?: string
          profile_id: string
          view_date?: string
          views?: number | null
        }
        Update: {
          contacts?: number | null
          id?: string
          profile_id?: string
          view_date?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          accompaniment_types: string[] | null
          available_days: string[] | null
          birth_place: string | null
          category: string
          city: string
          created_at: string
          description: string | null
          hair_color: string | null
          height_cm: number | null
          id: string
          image_url: string | null
          languages: string[] | null
          name: string
          nationality: string | null
          phone: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          phone_verified_by: string | null
          postal_code: string | null
          public_plan: string
          premium: boolean | null
          profession: string | null
          rating: number | null
          reviews_count: number | null
          schedule: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          verified: boolean | null
          views_count: number | null
          whatsapp: boolean | null
          weight_kg: number | null
          zone: string | null
        }
        Insert: {
          age?: number | null
          accompaniment_types?: string[] | null
          available_days?: string[] | null
          birth_place?: string | null
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name: string
          nationality?: string | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          phone_verified_by?: string | null
          postal_code?: string | null
          public_plan?: string
          premium?: boolean | null
          profession?: string | null
          rating?: number | null
          reviews_count?: number | null
          schedule?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          views_count?: number | null
          whatsapp?: boolean | null
          weight_kg?: number | null
          zone?: string | null
        }
        Update: {
          age?: number | null
          accompaniment_types?: string[] | null
          available_days?: string[] | null
          birth_place?: string | null
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name?: string
          nationality?: string | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          phone_verified_by?: string | null
          postal_code?: string | null
          public_plan?: string
          premium?: boolean | null
          profession?: string | null
          rating?: number | null
          reviews_count?: number | null
          schedule?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          views_count?: number | null
          whatsapp?: boolean | null
          weight_kg?: number | null
          zone?: string | null
        }
        Relationships: []
      }
      profile_media: {
        Row: {
          created_at: string
          id: string
          media_type: Database["public"]["Enums"]["profile_media_type"]
          position: number
          profile_id: string
          public_url: string | null
          storage_path: string
          visibility: Database["public"]["Enums"]["profile_media_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: Database["public"]["Enums"]["profile_media_type"]
          position?: number
          profile_id: string
          public_url?: string | null
          storage_path: string
          visibility?: Database["public"]["Enums"]["profile_media_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["profile_media_type"]
          position?: number
          profile_id?: string
          public_url?: string | null
          storage_path?: string
          visibility?: Database["public"]["Enums"]["profile_media_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_media_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          provider: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      profile_media_type: "image" | "video"
      profile_media_visibility: "public" | "registered" | "paid" | "vip"
      subscription_status: "inactive" | "active" | "past_due" | "canceled"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
