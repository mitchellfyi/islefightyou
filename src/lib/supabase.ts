import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types for type safety
export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url?: string
          level: number
          experience: number
          created_at: string
          last_active: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string
          level?: number
          experience?: number
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string
          level?: number
          experience?: number
          created_at?: string
          last_active?: string
        }
      }
      islands: {
        Row: {
          id: string
          player_id: string
          name: string
          seed: number
          size: number
          biome_data: any
          resource_data: any
          building_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          name: string
          seed: number
          size?: number
          biome_data?: any
          resource_data?: any
          building_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          name?: string
          seed?: number
          size?: number
          biome_data?: any
          resource_data?: any
          building_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      player_inventories: {
        Row: {
          id: string
          player_id: string
          item_type: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          item_type: string
          quantity: number
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          item_type?: string
          quantity?: number
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          island_id: string
          position_x: number
          position_y: number
          position_z: number
          rotation_x: number
          rotation_y: number
          health: number
          is_online: boolean
          last_ping: string
        }
        Insert: {
          id?: string
          player_id: string
          island_id: string
          position_x?: number
          position_y?: number
          position_z?: number
          rotation_x?: number
          rotation_y?: number
          health?: number
          is_online?: boolean
          last_ping?: string
        }
        Update: {
          id?: string
          player_id?: string
          island_id?: string
          position_x?: number
          position_y?: number
          position_z?: number
          rotation_x?: number
          rotation_y?: number
          health?: number
          is_online?: boolean
          last_ping?: string
        }
      }
    }
  }
}

export type Player = Database['public']['Tables']['players']['Row']
export type Island = Database['public']['Tables']['islands']['Row']
export type PlayerInventory = Database['public']['Tables']['player_inventories']['Row']
export type GameSession = Database['public']['Tables']['game_sessions']['Row'] 