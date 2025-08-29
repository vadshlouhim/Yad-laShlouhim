import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=7200',
    'Access-Control-Allow-Origin': '*',
    'X-Robots-Tag': 'noindex',
  };

  try {
    const baseUrl = process.env.SITE_URL || 'https://yad-lashlouhim.com';
    const currentDate = new Date().toISOString();
    
    // Index des sitemaps pour une architecture modulaire
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    return {
      statusCode: 200,
      headers,
      body: sitemapIndex,
    };

  } catch (error) {
    console.error('Error generating sitemap index:', error);
    
    const fallbackIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://yad-lashlouhim.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return {
      statusCode: 200,
      headers,
      body: fallbackIndex,
    };
  }
};