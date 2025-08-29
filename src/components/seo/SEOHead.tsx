import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
}

export const SEOHead = ({
  title = 'Yad La\'Shlouhim - Affiches Communautaires Juives Design',
  description = 'Templates Canva professionnels pour vos événements, invitations Shabbat, fêtes juives et annonces communautaires. Personnalisation facile et accès immédiat.',
  keywords = 'affiches juives, templates canva, événements communautaires, shabbat, fêtes juives, invitations, design, personnalisation',
  image = 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://yad-lashlouhim.netlify.app',
  type = 'website',
  author = 'Yad La\'Shlouhim',
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex = false,
  canonical
}: SEOHeadProps) => {
  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = title;

    // Fonction pour mettre à jour ou créer une meta tag
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    // Fonction pour mettre à jour ou créer un link tag
    const updateLinkTag = (rel: string, href: string) => {
      let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.rel = rel;
        document.head.appendChild(linkTag);
      }
      linkTag.href = href;
    };

    // Meta tags de base
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Yad La\'Shlouhim', true);
    updateMetaTag('og:locale', 'fr_FR', true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Meta tags spécifiques aux articles
    if (type === 'article') {
      if (author) updateMetaTag('article:author', author, true);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (section) updateMetaTag('article:section', section, true);
      if (tags) {
        tags.forEach(tag => {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'article:tag');
          metaTag.content = tag;
          document.head.appendChild(metaTag);
        });
      }
    }

    // Canonical URL
    updateLinkTag('canonical', canonical || url);

    // Cleanup function pour éviter les doublons
    return () => {
      // Nettoyage optionnel si nécessaire
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, section, tags, noindex, canonical]);

  return null; // Ce composant ne rend rien visuellement
};
