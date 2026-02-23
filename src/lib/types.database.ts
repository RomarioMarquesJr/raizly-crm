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
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          company_id: string
          name: string
          color: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          color?: string | null
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          color?: string | null
          order?: number
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          company_id: string
          stage_id: string | null
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          value: number
          status: 'open' | 'won' | 'lost'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          stage_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          value?: number
          status?: 'open' | 'won' | 'lost'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          stage_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          value?: number
          status?: 'open' | 'won' | 'lost'
          created_at?: string
          updated_at?: string
        }
      }
      lead_timeline_events: {
        Row: {
          id: string
          lead_id: string
          company_id: string
          user_id: string
          type: 'note' | 'stage_change' | 'email' | 'call' | 'meeting'
          content: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          company_id: string
          user_id: string
          type: 'note' | 'stage_change' | 'email' | 'call' | 'meeting'
          content?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          company_id?: string
          user_id?: string
          type?: 'note' | 'stage_change' | 'email' | 'call' | 'meeting'
          content?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          lead_id: string
          company_id: string
          user_id: string
          title: string
          due_date: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          company_id: string
          user_id: string
          title: string
          due_date: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          company_id?: string
          user_id?: string
          title?: string
          due_date?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      ai_outputs: {
        Row: {
          id: string
          company_id: string
          lead_id: string
          input_hash: string
          output_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          lead_id: string
          input_hash: string
          output_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          lead_id?: string
          input_hash?: string
          output_data?: Json
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          company_id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_company_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
