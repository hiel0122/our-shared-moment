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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          commenter_id: string | null
          content: string
          created_at: string
          id: string
          media_id: string | null
          password_hash: string | null
          writer: string
        }
        Insert: {
          commenter_id?: string | null
          content: string
          created_at?: string
          id?: string
          media_id?: string | null
          password_hash?: string | null
          writer: string
        }
        Update: {
          commenter_id?: string | null
          content?: string
          created_at?: string
          id?: string
          media_id?: string | null
          password_hash?: string | null
          writer?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation: {
        Row: {
          bride_father: string | null
          bride_mother: string | null
          couple_bride: string
          couple_groom: string
          created_at: string
          groom_father: string | null
          groom_mother: string | null
          hero_line1: string
          hero_line2: string
          hero_line3: string
          hero_video_url: string | null
          id: string
          intro_text: string | null
          updated_at: string
          wedding_at: string
        }
        Insert: {
          bride_father?: string | null
          bride_mother?: string | null
          couple_bride?: string
          couple_groom?: string
          created_at?: string
          groom_father?: string | null
          groom_mother?: string | null
          hero_line1?: string
          hero_line2?: string
          hero_line3?: string
          hero_video_url?: string | null
          id?: string
          intro_text?: string | null
          updated_at?: string
          wedding_at?: string
        }
        Update: {
          bride_father?: string | null
          bride_mother?: string | null
          couple_bride?: string
          couple_groom?: string
          created_at?: string
          groom_father?: string | null
          groom_mother?: string | null
          hero_line1?: string
          hero_line2?: string
          hero_line3?: string
          hero_video_url?: string | null
          id?: string
          intro_text?: string | null
          updated_at?: string
          wedding_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          author_name: string | null
          author_role: Database["public"]["Enums"]["author_role"]
          content: string | null
          created_at: string
          id: string
          likes_count: number | null
          sort_order: number
          title: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string | null
        }
        Insert: {
          author_name?: string | null
          author_role?: Database["public"]["Enums"]["author_role"]
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          sort_order?: number
          title?: string | null
          type: Database["public"]["Enums"]["media_type"]
          url?: string | null
        }
        Update: {
          author_name?: string | null
          author_role?: Database["public"]["Enums"]["author_role"]
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          sort_order?: number
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          url?: string | null
        }
        Relationships: []
      }
      media_likes: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          media_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          media_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_likes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          password_hash: string
          target: Database["public"]["Enums"]["message_target"]
          writer: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          password_hash: string
          target: Database["public"]["Enums"]["message_target"]
          writer: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          password_hash?: string
          target?: Database["public"]["Enums"]["message_target"]
          writer?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      venue: {
        Row: {
          address: string
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
        }
        Insert: {
          address?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "guest"
      author_role: "bride" | "groom"
      media_type: "video" | "image" | "text"
      message_target: "groom" | "bride"
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
      app_role: ["admin", "guest"],
      author_role: ["bride", "groom"],
      media_type: ["video", "image", "text"],
      message_target: ["groom", "bride"],
    },
  },
} as const
