export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: 'paracha' | 'evenements' | 'communaute' | 'dvar-torah' | 'fetes-juives';
  tags: string[];
  author: string;
  published_at: string;
  is_published: boolean;
  reading_minutes: number;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  canonical_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'achat' | 'canva' | 'livraison' | 'personnalisation' | 'general';
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
