export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          time_stage: string
          stage_entry_date: string
          assignee: string
          list: string
          priority: string
          energy: string
          location: string | null
          story: string | null
          labels: string[]
          icon: string
          highlighted: boolean
          status: string | null
          aging_status: string | null
          created_at: string
          updated_at: string
          created_by: string
          show_in_time_box: boolean
          show_in_list: boolean
          show_in_calendar: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string
          time_stage: string
          stage_entry_date: string
          assignee: string
          list: string
          priority?: string
          energy?: string
          location?: string | null
          story?: string | null
          labels?: string[]
          icon?: string
          highlighted?: boolean
          status?: string | null
          aging_status?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          show_in_time_box?: boolean
          show_in_list?: boolean
          show_in_calendar?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          time_stage?: string
          stage_entry_date?: string
          assignee?: string
          list?: string
          priority?: string
          energy?: string
          location?: string | null
          story?: string | null
          labels?: string[]
          icon?: string
          highlighted?: boolean
          status?: string | null
          aging_status?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          show_in_time_box?: boolean
          show_in_list?: boolean
          show_in_calendar?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          avatar_url: string | null
          updated_at: string | null
          is_admin: boolean
          first_name: string | null
          last_name: string | null
        }
        Insert: {
          id: string
          avatar_url?: string | null
          updated_at?: string | null
          is_admin?: boolean
          first_name?: string | null
          last_name?: string | null
        }
        Update: {
          id?: string
          avatar_url?: string | null
          updated_at?: string | null
          is_admin?: boolean
          first_name?: string | null
          last_name?: string | null
        }
      }
      time_boxes: {
        Row: {
          id: string
          name: string
          description: string
          warn_threshold: number | null
          expire_threshold: number | null
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          description: string
          warn_threshold?: number | null
          expire_threshold?: number | null
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          warn_threshold?: number | null
          expire_threshold?: number | null
          sort_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_full_name: {
        Args: {
          profile_row: unknown
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}