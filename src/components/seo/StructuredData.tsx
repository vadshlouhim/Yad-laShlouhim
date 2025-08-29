import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  contactPoint?: {
    '@type': string;
    contactType: string;
    email: string;
    telephone: string;
  };
  address?: {
    '@type': string;
    addressCountry: string;
  };
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

interface ArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage: string;
}

interface ProductSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  brand: {
    '@type': string;
    name: string;
  };
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

type StructuredDataProps = {
  type: 'organization' | 'website' | 'article' | 'product' | 'breadcrumb' | 'faq';
  data: any;
};

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const generateSchema = (): any => {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yad-lashlouhim.netlify.app';
      
      switch (type) {
        case 'organization':
          return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Yad La\'Shlouhim',
            url: baseUrl,
            logo: 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              email: 'Yad-lashlouhim770@gmail.com',
              telephone: '+33667288851'
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'FR'
            },
            ...data
          } as OrganizationSchema;

        case 'website':
          return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Yad La\'Shlouhim',
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            },
            ...data
          } as WebsiteSchema;

        case 'article':
          return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: data.title,
            description: data.description,
            image: data.image || 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png',
            datePublished: data.publishedTime,
            dateModified: data.modifiedTime || data.publishedTime,
            author: {
              '@type': 'Person',
              name: data.author || 'Yad La\'Shlouhim'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Yad La\'Shlouhim',
              logo: {
                '@type': 'ImageObject',
                url: 'https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png'
              }
            },
            mainEntityOfPage: data.url || baseUrl
          } as ArticleSchema;

        case 'product':
          return {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: data.name,
            description: data.description,
            image: data.image,
            category: data.category || 'Design graphique',
            brand: {
              '@type': 'Brand',
              name: data.brand || 'Yad La\'Shlouhim'
            },
            manufacturer: {
              '@type': 'Organization',
              name: 'Yad La\'Shlouhim'
            },
            offers: {
              '@type': 'Offer',
              price: (data.price_cents / 100).toFixed(2),
              priceCurrency: data.currency || 'EUR',
              availability: data.availability === 'InStock' ? 'https://schema.org/InStock' : 'https://schema.org/InStock',
              url: data.url || baseUrl,
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
              }
            ]
          } as ProductSchema;

        case 'faq':
          return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: data.questions.map((q: any) => ({
              '@type': 'Question',
              name: q.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer
              }
            }))
          } as FAQSchema;

        default:
          return null;
      }
    };

    const schema = generateSchema();
    if (!schema) return;

    // Créer ou mettre à jour le script JSON-LD
    const scriptId = `structured-data-${type}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(schema);

    // Cleanup
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [type, data]);

  return null;
};
