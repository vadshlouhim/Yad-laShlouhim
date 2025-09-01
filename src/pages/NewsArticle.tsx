import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/seo/SEOHead';
import { StructuredData } from '../components/seo/StructuredData';
import { supabase } from '../lib/supabase';
import { NewsArticle } from '../types/news';

export const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      // Charger l'article principal
      const { data: articleData, error: articleError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (articleError) throw articleError;
      setArticle(articleData);

      // Charger les articles liés (même catégorie)
      if (articleData) {
        const { data: relatedData } = await supabase
          .from('news_articles')
          .select('*')
          .eq('category', articleData.category)
          .eq('is_published', true)
          .neq('id', articleData.id)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedArticles(relatedData || []);
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'paracha': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'dvar-torah': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'fetes-juives': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'evenements': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'communaute': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'paracha': 'Paracha',
      'dvar-torah': 'Dvar Torah',
      'fetes-juives': 'Fêtes Juives',
      'evenements': 'Événements',
      'communaute': 'Communauté'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Container>
          <div className="py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Container>
          <div className="py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Article non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/news">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux actualités
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={article.seo_title || `${article.title} - Yad La'Shlouhim`}
        description={article.seo_description || article.excerpt}
        keywords={article.tags.join(', ')}
        image={article.og_image || article.cover_image}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
        author={article.author}
        publishedTime={article.published_at}
        modifiedTime={article.updated_at}
        section={getCategoryLabel(article.category)}
        tags={article.tags}
        canonical={article.canonical_url}
      />
      
      <StructuredData
        type="article"
        data={{
          title: article.title,
          description: article.excerpt,
          image: article.cover_image,
          publishedTime: article.published_at,
          modifiedTime: article.updated_at,
          author: article.author,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        }}
      />

      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Accueil', url: '/' },
            { name: 'Actualités', url: '/news' },
            { name: article.title }
          ]
        }}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Back Button */}
        <Container>
          <div className="pt-8 pb-4">
            <Link to="/news">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux actualités
              </Button>
            </Link>
          </div>
        </Container>

        {/* Article Header */}
        <Container>
          <article className="max-w-4xl mx-auto">
            <header className="pb-8">
              {/* Category Badge */}
              <div className="mb-6">
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                  {getCategoryLabel(article.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_minutes} min de lecture</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager</span>
                </button>
              </div>

              {/* Cover Image */}
              {article.cover_image && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Articles liés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <Link key={relatedArticle.id} to={`/news/${relatedArticle.slug}`}>
                      <div className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(relatedArticle.published_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </Container>
      </div>
    </>
  );
};
