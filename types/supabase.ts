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
          created_at: string
          current_letter_index: number
          current_player_id: string | null
          current_player_index: number
          current_word: string
          difficulty: string | null
          game_type: string
          id: number
          player_one_avatar: string
          player_one_id: string | null
          player_one_name: string
          player_one_score: number
          player_two_avatar: string
          player_two_id: string | null
          player_two_name: string
          player_two_score: number
          secret_key: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          current_letter_index?: number
          current_player_id?: string | null
          current_player_index?: number
          current_word?: string
          difficulty?: string | null
          game_type?: string
          id?: number
          player_one_avatar?: string
          player_one_id?: string | null
          player_one_name?: string
          player_one_score?: number
          player_two_avatar?: string
          player_two_id?: string | null
          player_two_name?: string
          player_two_score?: number
          secret_key?: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          current_letter_index?: number
          current_player_id?: string | null
          current_player_index?: number
          current_word?: string
          difficulty?: string | null
          game_type?: string
          id?: number
          player_one_avatar?: string
          player_one_id?: string | null
          player_one_name?: string
          player_one_score?: number
          player_two_avatar?: string
          player_two_id?: string | null
          player_two_name?: string
          player_two_score?: number
          secret_key?: string
          winner?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
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
