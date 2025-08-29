import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          created_at?: string;
        };
      };
      posters: {
        Row: {
          id: string;
          title: string;
          description: string;
          category_id: string;
          image_url: string;
          price_cents: number;
          currency: string;
          canva_link: string;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category_id: string;
          image_url: string;
          price_cents: number;
          currency?: string;
          canva_link: string;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category_id?: string;
          image_url?: string;
          price_cents?: number;
          currency?: string;
          canva_link?: string;
          is_published?: boolean;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          stripe_session_id: string;
          poster_id: string;
          customer_email: string;
          status: string;
          receipt_url: string | null;
          canva_link: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_session_id: string;
          poster_id: string;
          customer_email: string;
          status?: string;
          receipt_url?: string | null;
          canva_link: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          stripe_session_id?: string;
          poster_id?: string;
          customer_email?: string;
          status?: string;
          receipt_url?: string | null;
          canva_link?: string;
          created_at?: string;
        };
      };
    };
  };
};