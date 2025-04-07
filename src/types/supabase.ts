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
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          email_verified: boolean | null
          image: string | null
          role: 'admin' | 'barber'
          barbershop_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: boolean | null
          image?: string | null
          role?: 'admin' | 'barber'
          barbershop_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: boolean | null
          image?: string | null
          role?: 'admin' | 'barber'
          barbershop_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      barbershops: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          description: string | null
          logo: string | null
          opening_time: string
          closing_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          description?: string | null
          logo?: string | null
          opening_time: string
          closing_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          description?: string | null
          logo?: string | null
          opening_time?: string
          closing_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      barbers: {
        Row: {
          id: string
          user_id: string
          barbershop_id: string
          specialties: string[]
          commission: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          barbershop_id: string
          specialties?: string[]
          commission?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          barbershop_id?: string
          specialties?: string[]
          commission?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration: number
          barbershop_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration: number
          barbershop_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          barbershop_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          client_name: string
          client_phone: string
          client_email: string | null
          notes: string | null
          barbershop_id: string
          barber_id: string
          service_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          client_name: string
          client_phone: string
          client_email?: string | null
          notes?: string | null
          barbershop_id: string
          barber_id: string
          service_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          client_name?: string
          client_phone?: string
          client_email?: string | null
          notes?: string | null
          barbershop_id?: string
          barber_id?: string
          service_id?: string
          created_at?: string
          updated_at?: string
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
} 