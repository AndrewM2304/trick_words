export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: number
          created_at: string
          current_word: string
          current_letter_index: number
          computer: boolean
          secret_key: string
          current_player_index: number
          player_one_score: number
          player_two_score: number
          player_one_id: string | null
          player_two_id: string | null
          player_one_name: string
          player_two_name: string
          player_one_avatar: string
          player_two_avatar: string
        }
        Insert: {
          id?: number
          created_at?: string
          current_word?: string
          current_letter_index?: number
          computer?: boolean
          secret_key?: string
          current_player_index?: number
          player_one_score?: number
          player_two_score?: number
          player_one_id?: string | null
          player_two_id?: string | null
          player_one_name?: string
          player_two_name?: string
          player_one_avatar?: string
          player_two_avatar?: string
        }
        Update: {
          id?: number
          created_at?: string
          current_word?: string
          current_letter_index?: number
          computer?: boolean
          secret_key?: string
          current_player_index?: number
          player_one_score?: number
          player_two_score?: number
          player_one_id?: string | null
          player_two_id?: string | null
          player_one_name?: string
          player_two_name?: string
          player_one_avatar?: string
          player_two_avatar?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
