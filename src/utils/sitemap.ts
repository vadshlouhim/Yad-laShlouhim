import { supabase } from '../lib/supabase';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://yad-lashlouhim.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urls: SitemapUrl[] = [
    // Pages statiques
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/faq`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/news`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7
    }
  ];

  try {
    // Récupérer les articles de news publiés
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (!articlesError && articles) {
      articles.forEach(article => {
        urls.push({
          loc: `${baseUrl}/news/${article.slug}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    }
  } catch (error) {
    console.log('Could not fetch articles for sitemap, using static pages only');
  }

  // Générer le XML
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

  const xmlUrls = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  const xmlFooter = '</urlset>';

  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

export const downloadSitemap = async () => {
  try {
    const sitemapContent = await generateSitemap();
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    alert('Erreur lors de la génération du sitemap');
  }
};
</parameter>