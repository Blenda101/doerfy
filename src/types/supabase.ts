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
      banner_configs: {
        Row: {
          audio: Json | null
          autoplay: boolean | null
          created_at: string | null
          id: string
          images: Json | null
          quote_duration: number | null
          quote_rotation: boolean | null
          quotes: Json | null
          text_style: Json | null
          transition_time: number | null
          updated_at: string | null
          user_id: string
          volume: number | null
        }
        Insert: {
          audio?: Json | null
          autoplay?: boolean | null
          created_at?: string | null
          id?: string
          images?: Json | null
          quote_duration?: number | null
          quote_rotation?: boolean | null
          quotes?: Json | null
          text_style?: Json | null
          transition_time?: number | null
          updated_at?: string | null
          user_id: string
          volume?: number | null
        }
        Update: {
          audio?: Json | null
          autoplay?: boolean | null
          created_at?: string | null
          id?: string
          images?: Json | null
          quote_duration?: number | null
          quote_rotation?: boolean | null
          quotes?: Json | null
          text_style?: Json | null
          transition_time?: number | null
          updated_at?: string | null
          user_id?: string
          volume?: number | null
        }
        Relationships: []
      }
      lists: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          author_id: string
          color_theme: string
          created_at: string | null
          description: string | null
          filter_criteria: Json | null
          id: string
          is_dynamic: boolean | null
          is_protected: boolean | null
          labels: string[] | null
          note_ids: string[] | null
          pin_hash: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          color_theme: string
          created_at?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_dynamic?: boolean | null
          is_protected?: boolean | null
          labels?: string[] | null
          note_ids?: string[] | null
          pin_hash?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          color_theme?: string
          created_at?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_dynamic?: boolean | null
          is_protected?: boolean | null
          labels?: string[] | null
          note_ids?: string[] | null
          pin_hash?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          author: string
          color_theme: string
          content: string
          created_at: string | null
          id: string
          is_protected: boolean | null
          labels: string[] | null
          notebook_id: string | null
          pin_hash: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author: string
          color_theme: string
          content?: string
          created_at?: string | null
          id?: string
          is_protected?: boolean | null
          labels?: string[] | null
          notebook_id?: string | null
          pin_hash?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          color_theme?: string
          content?: string
          created_at?: string | null
          id?: string
          is_protected?: boolean | null
          labels?: string[] | null
          notebook_id?: string | null
          pin_hash?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          assignee: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          effort_estimate: number | null
          goals: Json | null
          id: string
          labels: string[] | null
          mission: string | null
          parent_id: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          vision: string | null
          what_done_looks_like: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          effort_estimate?: number | null
          goals?: Json | null
          id: string
          labels?: string[] | null
          mission?: string | null
          parent_id?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          vision?: string | null
          what_done_looks_like?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          effort_estimate?: number | null
          goals?: Json | null
          id?: string
          labels?: string[] | null
          mission?: string | null
          parent_id?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          vision?: string | null
          what_done_looks_like?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          aging_status: string | null
          alarm_enabled: boolean | null
          assignee: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_days: number | null
          duration_hours: number | null
          ends_after_occurrences: number | null
          ends_date: string | null
          ends_type: Database["public"]["Enums"]["ends_type"] | null
          energy: string | null
          highlighted: boolean | null
          icon: string | null
          id: string
          labels: string[] | null
          lead_days: number | null
          lead_hours: number | null
          list_id: string | null
          location: string | null
          priority: string | null
          recurring: Database["public"]["Enums"]["recurring_pattern"] | null
          recurring_interval: number | null
          schedule_date: string | null
          schedule_time: string | null
          show_in_calendar: boolean | null
          show_in_list: boolean | null
          show_in_time_box: boolean | null
          stage_entry_date: string
          status: string | null
          story: string | null
          story_id: string | null
          timestage: string
          title: string
          updated_at: string | null
          week_days: Database["public"]["Enums"]["week_days"][] | null
          workdays_only: boolean | null
        }
        Insert: {
          aging_status?: string | null
          alarm_enabled?: boolean | null
          assignee: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_days?: number | null
          duration_hours?: number | null
          ends_after_occurrences?: number | null
          ends_date?: string | null
          ends_type?: Database["public"]["Enums"]["ends_type"] | null
          energy?: string | null
          highlighted?: boolean | null
          icon?: string | null
          id?: string
          labels?: string[] | null
          lead_days?: number | null
          lead_hours?: number | null
          list_id?: string | null
          location?: string | null
          priority?: string | null
          recurring?: Database["public"]["Enums"]["recurring_pattern"] | null
          recurring_interval?: number | null
          schedule_date?: string | null
          schedule_time?: string | null
          show_in_calendar?: boolean | null
          show_in_list?: boolean | null
          show_in_time_box?: boolean | null
          stage_entry_date?: string
          status?: string | null
          story?: string | null
          story_id?: string | null
          timestage: string
          title: string
          updated_at?: string | null
          week_days?: Database["public"]["Enums"]["week_days"][] | null
          workdays_only?: boolean | null
        }
        Update: {
          aging_status?: string | null
          alarm_enabled?: boolean | null
          assignee?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_days?: number | null
          duration_hours?: number | null
          ends_after_occurrences?: number | null
          ends_date?: string | null
          ends_type?: Database["public"]["Enums"]["ends_type"] | null
          energy?: string | null
          highlighted?: boolean | null
          icon?: string | null
          id?: string
          labels?: string[] | null
          lead_days?: number | null
          lead_hours?: number | null
          list_id?: string | null
          location?: string | null
          priority?: string | null
          recurring?: Database["public"]["Enums"]["recurring_pattern"] | null
          recurring_interval?: number | null
          schedule_date?: string | null
          schedule_time?: string | null
          show_in_calendar?: boolean | null
          show_in_list?: boolean | null
          show_in_time_box?: boolean | null
          stage_entry_date?: string
          status?: string | null
          story?: string | null
          story_id?: string | null
          timestage?: string
          title?: string
          updated_at?: string | null
          week_days?: Database["public"]["Enums"]["week_days"][] | null
          workdays_only?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_timestage_fkey"
            columns: ["timestage"]
            isOneToOne: false
            referencedRelation: "time_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      time_boxes: {
        Row: {
          description: string
          expireThreshold: number | null
          id: string
          name: string
          sort_order: number
          warnThreshold: number | null
        }
        Insert: {
          description: string
          expireThreshold?: number | null
          id: string
          name: string
          sort_order: number
          warnThreshold?: number | null
        }
        Update: {
          description?: string
          expireThreshold?: number | null
          id?: string
          name?: string
          sort_order?: number
          warnThreshold?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_full_name: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: string
      }
    }
    Enums: {
      ends_type: "never" | "on-date" | "after-occurrences"
      recurring_pattern: "daily" | "weekly" | "monthly" | "yearly" | "none"
      week_days: "S" | "M" | "T" | "W" | "Th" | "F" | "Sa" | "Su"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ends_type: ["never", "on-date", "after-occurrences"],
      recurring_pattern: ["daily", "weekly", "monthly", "yearly", "none"],
      week_days: ["S", "M", "T", "W", "Th", "F", "Sa", "Su"],
    },
  },
} as const
