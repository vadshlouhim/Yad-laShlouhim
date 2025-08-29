import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600', // Cache 1 heure
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const baseUrl = process.env.SITE_URL || 'https://yad-lashlouhim.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // URLs statiques
    const staticUrls = [
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

    let dynamicUrls: any[] = [];

    try {
      // Récupérer les articles de news publiés
      const { data: articles, error: articlesError } = await supabase
        .from('news_articles')
        .select('slug, updated_at, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (!articlesError && articles) {
        dynamicUrls = articles.map(article => ({
          loc: `${baseUrl}/news/${article.slug}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6
        }));
      }
    } catch (error) {
      console.log('Could not fetch dynamic content for sitemap');
    }

    // Combiner toutes les URLs
    const allUrls = [...staticUrls, ...dynamicUrls];

    // Générer le XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return {
      statusCode: 200,
      headers,
      body: xmlContent,
    };

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback vers un sitemap minimal
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yad-lashlouhim.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yad-lashlouhim.com/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yad-lashlouhim.com/news</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return {
      statusCode: 200,
      headers,
      body: fallbackSitemap,
    };
  }
};
</parameter>