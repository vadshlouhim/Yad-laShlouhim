// Utilitaires SEO avancés pour le site

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
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
  hreflang?: Record<string, string>;
}

export const generateMetaTags = (config: SEOConfig): string => {
  const baseUrl = 'https://yad-lashlouhim.com';
  const defaultImage = 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png';
  
  const tags = [
    `<title>${config.title}</title>`,
    `<meta name="description" content="${config.description}" />`,
    `<meta name="keywords" content="${config.keywords.join(', ')}" />`,
    `<meta name="author" content="${config.author || 'Yad La\'Shlouhim'}" />`,
    `<meta name="robots" content="${config.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'}" />`,
    
    // Open Graph
    `<meta property="og:title" content="${config.title}" />`,
    `<meta property="og:description" content="${config.description}" />`,
    `<meta property="og:image" content="${config.image || defaultImage}" />`,
    `<meta property="og:url" content="${config.url || baseUrl}" />`,
    `<meta property="og:type" content="${config.type || 'website'}" />`,
    `<meta property="og:site_name" content="Yad La'Shlouhim" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    
    // Twitter Card
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${config.title}" />`,
    `<meta name="twitter:description" content="${config.description}" />`,
    `<meta name="twitter:image" content="${config.image || defaultImage}" />`,
    
    // Canonical
    `<link rel="canonical" href="${config.canonical || config.url || baseUrl}" />`
  ];

  // Article-specific tags
  if (config.type === 'article') {
    if (config.author) tags.push(`<meta property="article:author" content="${config.author}" />`);
    if (config.publishedTime) tags.push(`<meta property="article:published_time" content="${config.publishedTime}" />`);
    if (config.modifiedTime) tags.push(`<meta property="article:modified_time" content="${config.modifiedTime}" />`);
    if (config.section) tags.push(`<meta property="article:section" content="${config.section}" />`);
    if (config.tags) {
      config.tags.forEach(tag => {
        tags.push(`<meta property="article:tag" content="${tag}" />`);
      });
    }
  }

  // Hreflang tags
  if (config.hreflang) {
    Object.entries(config.hreflang).forEach(([lang, url]) => {
      tags.push(`<link rel="alternate" hreflang="${lang}" href="${url}" />`);
    });
  }

  return tags.join('\n');
};

export const generateStructuredData = (type: string, data: any): string => {
  const baseUrl = 'https://yad-lashlouhim.com';
  
  const schemas: Record<string, any> = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Yad La\'Shlouhim',
      url: baseUrl,
      logo: 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'Yad-lashlouhim770@gmail.com',
        telephone: '+33667288851',
        availableLanguage: ['French', 'Hebrew'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '22:00'
        }
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'FR',
        addressRegion: 'Île-de-France'
      },
      sameAs: [
        'https://wa.me/33667288851'
      ],
      areaServed: {
        '@type': 'Country',
        name: 'France'
      },
      knowsAbout: [
        'Design graphique',
        'Affiches communautaires',
        'Événements juifs',
        'Templates Canva',
        'Communication visuelle'
      ],
      ...data
    },
    
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Yad La\'Shlouhim',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Services',
        itemListElement: [
          {
            '@type': 'Service',
            name: 'Templates d\'affiches Canva',
            description: 'Modèles professionnels pour événements communautaires juifs'
          },
          {
            '@type': 'Service', 
            name: 'Personnalisation graphique',
            description: 'Adaptation de vos affiches selon vos besoins'
          }
        ]
      },
      ...data
    }
  };

  return JSON.stringify(schemas[type] || data, null, 2);
};

export const optimizeForLocalSEO = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Yad La\'Shlouhim',
    image: 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png',
    telephone: '+33667288851',
    email: 'Yad-lashlouhim770@gmail.com',
    url: 'https://yad-lashlouhim.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressRegion: 'Île-de-France',
      addressLocality: 'Paris'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8566,
      longitude: 2.3522
    },
    openingHours: 'Mo-Su 08:00-22:00',
    priceRange: '€€',
    servesCuisine: 'Design graphique',
    serviceArea: {
      '@type': 'Country',
      name: 'France'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Sarah L.'
        },
        reviewBody: 'Templates magnifiques et très faciles à personnaliser sur Canva!'
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5'
        },
        author: {
          '@type': 'Person',
          name: 'David M.'
        },
        reviewBody: 'Service rapide et professionnel. Parfait pour nos événements communautaires.'
      }
    ]
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url?: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `https://yad-lashlouhim.com${item.url}` : undefined
    }))
  };
};

export const generateFAQSchema = (questions: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  };
};

export const generateProductSchema = (product: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category || 'Design graphique',
    brand: {
      '@type': 'Brand',
      name: 'Yad La\'Shlouhim'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Yad La\'Shlouhim'
    },
    offers: {
      '@type': 'Offer',
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: product.currency || 'EUR',
      availability: 'https://schema.org/InStock',
      url: product.url || 'https://yad-lashlouhim.com',
      seller: {
        '@type': 'Organization',
        name: 'Yad La\'Shlouhim'
      },
      validFrom: new Date().toISOString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    }
  };
};