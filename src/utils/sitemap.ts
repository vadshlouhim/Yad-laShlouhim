import { supabase } from '../lib/supabase';

export interface SitemapUrl {
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

export interface SitemapStats {
  totalUrls: number;
  staticPages: number;
  newsArticles: number;
  categories: number;
  lastGenerated: string;
}

export const generateSitemap = async (): Promise<{ content: string; stats: SitemapStats }> => {
  const baseUrl = 'https://yad-lashlouhim.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urls: SitemapUrl[] = [];
  let stats: SitemapStats = {
    totalUrls: 0,
    staticPages: 0,
    newsArticles: 0,
    categories: 0,
    lastGenerated: new Date().toISOString()
  };

  // 1. Pages statiques principales
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
  stats.staticPages = staticPages.length;

  try {
    // 2. Articles de news publiés
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('slug, updated_at, published_at, title, cover_image')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

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
            title: article.title,
            caption: `Article: ${article.title}`
          }];
        }

        urls.push(articleUrl);
      });
      stats.newsArticles = articles.length;
    }

    // 3. Catégories d'affiches (pour le SEO)
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, name, created_at')
      .order('name');

    if (!categoriesError && categories) {
      categories.forEach(category => {
        urls.push({
          loc: `${baseUrl}/#${category.slug}`,
          lastmod: new Date(category.created_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.5
        });
      });
      stats.categories = categories.length;
    }

    // 4. Pages d'affiches individuelles (si on veut créer des pages dédiées)
    const { data: posters, error: postersError } = await supabase
      .from('posters')
      .select('id, title, image_url, updated_at, category:categories(slug)')
      .eq('is_published', true)
      .limit(50); // Limiter pour éviter un sitemap trop lourd

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
            title: poster.title,
            caption: `Affiche: ${poster.title}`
          }];
        }

        urls.push(posterUrl);
      });
    }

  } catch (error) {
    console.log('Error fetching dynamic content for sitemap:', error);
  }

  stats.totalUrls = urls.length;

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
      <image:title>${escapeXml(image.title)}</image:title>`;
        }
        if (image.caption) {
          urlXml += `
      <image:caption>${escapeXml(image.caption)}</image:caption>`;
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
  const content = `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;

  return { content, stats };
};

// Fonction pour échapper les caractères XML
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const downloadSitemap = async (): Promise<SitemapStats> => {
  try {
    const { content, stats } = await generateSitemap();
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitemap-${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return stats;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw new Error('Erreur lors de la génération du sitemap');
  }
};

export const validateSitemap = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérifications basiques
  if (!content.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    errors.push('Déclaration XML manquante');
  }
  
  if (!content.includes('<urlset')) {
    errors.push('Élément urlset manquant');
  }
  
  if (!content.includes('</urlset>')) {
    errors.push('Fermeture urlset manquante');
  }
  
  // Compter les URLs
  const urlMatches = content.match(/<url>/g);
  if (!urlMatches || urlMatches.length === 0) {
    errors.push('Aucune URL trouvée dans le sitemap');
  }
  
  // Vérifier les URLs HTTPS
  const httpUrls = content.match(/http:\/\/[^<]+/g);
  if (httpUrls) {
    errors.push(`${httpUrls.length} URL(s) en HTTP détectée(s) - utilisez HTTPS`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const submitSitemapToGoogle = async (): Promise<boolean> => {
  try {
    // Ping Google pour notifier la mise à jour du sitemap
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent('https://yad-lashlouhim.com/sitemap.xml')}`;
    
    const response = await fetch(pingUrl, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Error submitting sitemap to Google:', error);
    return false;
  }
};

export const analyzeSitemapPerformance = async (): Promise<{
  totalUrls: number;
  avgPriority: number;
  changefreqDistribution: Record<string, number>;
  lastModDistribution: Record<string, number>;
}> => {
  try {
    const { content, stats } = await generateSitemap();
    
    // Parser le contenu pour analyser
    const priorityMatches = content.match(/<priority>([\d.]+)<\/priority>/g) || [];
    const priorities = priorityMatches.map(match => parseFloat(match.replace(/<\/?priority>/g, '')));
    const avgPriority = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
    
    const changefreqMatches = content.match(/<changefreq>([^<]+)<\/changefreq>/g) || [];
    const changefreqDistribution: Record<string, number> = {};
    changefreqMatches.forEach(match => {
      const freq = match.replace(/<\/?changefreq>/g, '');
      changefreqDistribution[freq] = (changefreqDistribution[freq] || 0) + 1;
    });
    
    const lastmodMatches = content.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
    const lastModDistribution: Record<string, number> = {};
    lastmodMatches.forEach(match => {
      const date = match.replace(/<\/?lastmod>/g, '');
      const month = date.substring(0, 7); // YYYY-MM
      lastModDistribution[month] = (lastModDistribution[month] || 0) + 1;
    });
    
    return {
      totalUrls: stats.totalUrls,
      avgPriority: Math.round(avgPriority * 100) / 100,
      changefreqDistribution,
      lastModDistribution
    };
  } catch (error) {
    console.error('Error analyzing sitemap:', error);
    throw error;
  }
};