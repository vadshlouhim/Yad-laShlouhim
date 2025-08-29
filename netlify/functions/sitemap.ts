import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache 1h navigateur, 2h CDN
    'Access-Control-Allow-Origin': '*',
    'X-Robots-Tag': 'noindex', // Le sitemap lui-même ne doit pas être indexé
  };

  try {
    const baseUrl = process.env.SITE_URL || 'https://yad-lashlouhim.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const urls: SitemapUrl[] = [];

    // 1. Pages statiques avec priorités optimisées
    const staticPages = [
      {
        loc: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'weekly' as const,
        priority: 1.0
      },
      {
        loc: `${baseUrl}/faq`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.8
      },
      {
        loc: `${baseUrl}/news`,
        lastmod: currentDate,
        changefreq: 'weekly' as const,
        priority: 0.7
      }
    ];

    urls.push(...staticPages);

    try {
      // 2. Articles de news avec images
      const { data: articles, error: articlesError } = await supabase
        .from('news_articles')
        .select('slug, updated_at, published_at, title, cover_image, excerpt')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(100); // Limiter pour éviter un sitemap trop lourd

      if (!articlesError && articles) {
        articles.forEach(article => {
          const articleUrl: SitemapUrl = {
            loc: `${baseUrl}/news/${article.slug}`,
            lastmod: new Date(article.updated_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
          };

          // Ajouter l'image de couverture si disponible
          if (article.cover_image) {
            articleUrl.images = [{
              loc: article.cover_image,
              title: escapeXml(article.title),
              caption: escapeXml(article.excerpt || `Article: ${article.title}`)
            }];
          }

          urls.push(articleUrl);
        });
      }

      // 3. Catégories d'affiches (ancres SEO)
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('slug, name, created_at')
        .order('name')
        .limit(50);

      if (!categoriesError && categories) {
        categories.forEach(category => {
          urls.push({
            loc: `${baseUrl}/#${category.slug}`,
            lastmod: new Date(category.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.5
          });
        });
      }

      // 4. Affiches individuelles (pour SEO avancé)
      const { data: posters, error: postersError } = await supabase
        .from('posters')
        .select(`
          id, 
          title, 
          image_url, 
          updated_at, 
          description,
          category:categories(slug, name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!postersError && posters) {
        posters.forEach(poster => {
          const posterUrl: SitemapUrl = {
            loc: `${baseUrl}/affiche/${poster.id}`,
            lastmod: new Date(poster.updated_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.4
          };

          // Ajouter l'image de l'affiche
          if (poster.image_url) {
            posterUrl.images = [{
              loc: poster.image_url,
              title: escapeXml(poster.title),
              caption: escapeXml(poster.description || `Affiche: ${poster.title}`)
            }];
          }

          urls.push(posterUrl);
        });
      }

    } catch (dbError) {
      console.log('Database error, using static sitemap only:', dbError);
    }

    // Trier les URLs par priorité décroissante
    urls.sort((a, b) => b.priority - a.priority);

    // Générer le XML avec support des images
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    const xmlUrls = urls.map(url => {
      let urlXml = `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;

      // Ajouter les images si disponibles
      if (url.images && url.images.length > 0) {
        url.images.forEach(image => {
          urlXml += `
    <image:image>
      <image:loc>${image.loc}</image:loc>`;
          if (image.title) {
            urlXml += `
      <image:title>${image.title}</image:title>`;
          }
          if (image.caption) {
            urlXml += `
      <image:caption>${image.caption}</image:caption>`;
          }
          urlXml += `
    </image:image>`;
        });
      }

      urlXml += `
  </url>`;
      return urlXml;
    }).join('\n');

    const xmlFooter = '</urlset>';
    const xmlContent = `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;

    // Ajouter des headers pour l'optimisation
    const optimizedHeaders = {
      ...headers,
      'X-Sitemap-URLs': urls.length.toString(),
      'X-Generated-At': new Date().toISOString(),
      'X-Content-Source': 'dynamic-supabase',
      'Vary': 'Accept-Encoding',
    };

    return {
      statusCode: 200,
      headers: optimizedHeaders,
      body: xmlContent,
    };

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback vers un sitemap minimal mais complet
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
      headers: {
        ...headers,
        'X-Fallback': 'true',
        'X-Error': 'database-unavailable'
      },
      body: fallbackSitemap,
    };
  }
};