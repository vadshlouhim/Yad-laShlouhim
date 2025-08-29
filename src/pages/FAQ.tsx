import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, ShoppingBag, Palette, Truck, Settings } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/seo/SEOHead';
import { StructuredData } from '../components/seo/StructuredData';
import { supabase } from '../lib/supabase';
import { FAQItem } from '../types/news';

export const FAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = [
    { value: 'all', label: 'Toutes les questions', icon: HelpCircle },
    { value: 'achat', label: 'Achat & Paiement', icon: ShoppingBag },
    { value: 'canva', label: 'Canva & Utilisation', icon: Palette },
    { value: 'livraison', label: 'Livraison & Accès', icon: Truck },
    { value: 'personnalisation', label: 'Personnalisation', icon: Settings },
    { value: 'general', label: 'Questions générales', icon: HelpCircle }
  ];

  // FAQ par défaut pour améliorer le SEO
  const defaultFAQ: FAQItem[] = [
    {
      id: '1',
      question: 'Comment fonctionne le paiement ?',
      answer: 'Le paiement s\'effectue de manière 100% sécurisée via Stripe. Nous acceptons toutes les cartes bancaires principales (Visa, Mastercard, American Express). Après validation de votre paiement, vous recevez immédiatement votre lien Canva par email.',
      category: 'achat',
      order_index: 1,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      question: 'Comment recevoir mon affiche ?',
      answer: 'Dès que votre paiement est confirmé, vous recevez instantanément par email un lien Canva vous donnant accès à votre modèle. Vous pouvez alors le personnaliser et le télécharger en haute qualité (PDF, PNG, JPG).',
      category: 'livraison',
      order_index: 2,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      question: 'Puis-je modifier les textes et couleurs ?',
      answer: 'Absolument ! Tous nos modèles Canva sont 100% personnalisables. Vous pouvez modifier les textes, changer les couleurs, ajuster les polices, ajouter des éléments ou des photos. L\'interface Canva est très intuitive.',
      category: 'personnalisation',
      order_index: 3,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      question: 'Quel est le délai de livraison ?',
      answer: 'Il n\'y a aucun délai ! L\'accès à votre modèle Canva est immédiat dès validation du paiement. Vous pouvez personnaliser et télécharger vos visuels sans attendre.',
      category: 'livraison',
      order_index: 4,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      question: 'Canva est-il gratuit ?',
      answer: 'L\'édition de votre modèle sur Canva est entièrement gratuite. Vous n\'avez besoin que d\'un compte Canva gratuit pour accéder à votre modèle et le personnaliser. Le téléchargement en qualité standard est inclus.',
      category: 'canva',
      order_index: 5,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      question: 'Puis-je imprimer en grand format (A3, A2) ?',
      answer: 'Oui ! Nos modèles sont conçus en haute résolution et peuvent être imprimés jusqu\'en A2 sans perte de qualité. Vous pouvez télécharger votre création en PDF haute définition depuis Canva.',
      category: 'personnalisation',
      order_index: 6,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      question: 'Je n\'ai pas reçu l\'email avec mon lien',
      answer: 'Vérifiez d\'abord votre dossier spam/courrier indésirable. Si vous ne trouvez toujours pas l\'email, contactez-nous à Vadshlouhim@gmail.com avec votre numéro de commande, nous vous renverrons le lien immédiatement.',
      category: 'achat',
      order_index: 7,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      question: 'Puis-je réutiliser le modèle plusieurs fois ?',
      answer: 'Bien sûr ! Une fois acheté, vous avez un accès illimité à votre modèle. Vous pouvez le réutiliser autant de fois que vous le souhaitez, le dupliquer, et créer plusieurs versions pour différents événements.',
      category: 'general',
      order_index: 8,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '9',
      question: 'Proposez-vous des adaptations sur mesure ?',
      answer: 'Oui ! Si vous avez besoin d\'une adaptation spécifique ou d\'un modèle personnalisé, contactez-nous via notre formulaire de contact. Nous étudions toutes les demandes et proposons des solutions sur mesure.',
      category: 'general',
      order_index: 9,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      question: 'Les modèles sont-ils conformes aux traditions juives ?',
      answer: 'Absolument ! Tous nos modèles sont créés dans le respect des traditions et valeurs de la communauté juive. Nous portons une attention particulière au contenu, aux images utilisées et au respect des fêtes et coutumes.',
      category: 'general',
      order_index: 10,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_published', true)
        .order('order_index');

      if (error) {
        console.log('Using default FAQ');
        setFaqItems(defaultFAQ);
      } else {
        setFaqItems(data.length > 0 ? data : defaultFAQ);
      }
    } catch (error) {
      console.log('Using default FAQ');
      setFaqItems(defaultFAQ);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQ = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.icon : HelpCircle;
  };

  return (
    <>
      <SEOHead
        title="FAQ - Questions fréquentes sur nos affiches Canva - Yad La'Shlouhim"
        description="Trouvez toutes les réponses à vos questions sur l'achat, la personnalisation et l'utilisation de nos modèles d'affiches Canva. Support client disponible 24h/24."
        keywords="FAQ, questions fréquentes, aide, support, canva, affiches, paiement, personnalisation, livraison"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      
      <StructuredData
        type="faq"
        data={{
          questions: filteredFAQ.map(item => ({
            question: item.question,
            answer: item.answer
          }))
        }}
      />

      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Accueil', url: '/' },
            { name: 'FAQ' }
          ]
        }}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Questions fréquentes
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Trouvez rapidement les réponses à toutes vos questions sur nos affiches Canva
              </p>
            </div>
          </Container>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-lg"
                />
              </div>

              {/* Category Filters */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.value
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ Items */}
        <section className="py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredFAQ.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQ.map((item) => {
                    const isOpen = openItems.includes(item.id);
                    const CategoryIcon = getCategoryIcon(item.category);
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-2xl"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <CategoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.question}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="pl-14">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Aucune question trouvée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Essayez de modifier votre recherche ou de changer de catégorie.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                    }}
                    variant="outline"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Notre équipe est là pour vous aider ! Contactez-nous pour obtenir une réponse personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:Yad-lashlouhim770@gmail.com">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Envoyer un email
                  </Button>
                </a>
                <a href="tel:+33667288851">
                  <Button variant="outline" size="lg">
                    Appeler au +33 6 67 28 88 51
                  </Button>
                </a>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Réponse garantie sous 2h • Service disponible 24h/24
              </p>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
};
