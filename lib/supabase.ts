import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  created_at: string;
};

export type CollectionImage = {
  url: string;
  thumbnail_url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  images: CollectionImage[];
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
};

export type Settings = {
  id: string;
  key: string;
  value: any;
  updated_at: string;
};
