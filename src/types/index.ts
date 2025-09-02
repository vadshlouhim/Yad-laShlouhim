export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface Poster {
  id: string;
  title: string;
  description: string;
  category_id: string;
  image_url: string;
  price_cents: number;
  currency: string;
  canva_link: string;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  category?: Category;
}

export interface Purchase {
  id: string;
  stripe_session_id: string;
  poster_id: string;
  customer_email: string;
  status: string;
  receipt_url: string | null;
  canva_link: string;
  created_at: string;
  poster?: Poster;
}

export interface PurchaseResponse {
  canva_link: string;
  receipt_url: string | null;
  poster_title: string;
}

export type SortOption = 'recent' | 'price-low' | 'price-high';