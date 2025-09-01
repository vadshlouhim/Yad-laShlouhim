import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Poster, Category } from '../../types';

interface SearchBarProps {
  posters: Poster[];
  categories: Category[];
  onSearch: (results: Poster[], searchTerm: string) => void;
  placeholder?: string;
}

interface SearchResult {
  poster: Poster;
  matchType: 'title' | 'category' | 'description';
  matchText: string;
}

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'category';
  count?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  posters, 
  categories, 
  onSearch,
  placeholder = "Rechercher une affiche, catégorie..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yls-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder les recherches récentes
  const saveToRecentSearches = (term: string) => {
    if (term.trim().length < 2) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('yls-recent-searches', JSON.stringify(updated));
  };

  // Fonction de recherche avancée
  const performSearch = (term: string): SearchResult[] => {
    if (!term.trim()) return [];
    
    const searchTermLower = term.toLowerCase().trim();
    const results: SearchResult[] = [];

    posters.forEach(poster => {
      const category = categories.find(cat => cat.id === poster.category_id);
      
      // Recherche dans le titre
      if (poster.title.toLowerCase().includes(searchTermLower)) {
        results.push({
          poster,
          matchType: 'title',
          matchText: poster.title
        });
        return;
      }
      
      // Recherche dans la catégorie
      if (category?.name.toLowerCase().includes(searchTermLower)) {
        results.push({
          poster,
          matchType: 'category',
          matchText: category.name
        });
        return;
      }
      
      // Recherche dans la description
      if (poster.description?.toLowerCase().includes(searchTermLower)) {
        results.push({
          poster,
          matchType: 'description',
          matchText: poster.description.substring(0, 100) + '...'
        });
      }
    });

    return results;
  };

  // Générer les suggestions intelligentes
  const generateSuggestions = (term: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    if (!term.trim()) {
      // Suggestions par défaut
      if (recentSearches.length > 0) {
        recentSearches.slice(0, 3).forEach(search => {
          suggestions.push({ text: search, type: 'recent' });
        });
      }
      
      // Catégories populaires
      const popularCategories = categories.slice(0, 4);
      popularCategories.forEach(category => {
        const count = posters.filter(p => p.category_id === category.id).length;
        suggestions.push({ 
          text: category.name, 
          type: 'category',
          count 
        });
      });
      
      return suggestions;
    }

    const searchTermLower = term.toLowerCase();
    
    // Suggestions de catégories matchantes
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(searchTermLower)) {
        const count = posters.filter(p => p.category_id === category.id).length;
        suggestions.push({ 
          text: category.name, 
          type: 'category',
          count 
        });
      }
    });

    // Suggestions de titres d'affiches
    const titleMatches = posters
      .filter(poster => poster.title.toLowerCase().includes(searchTermLower))
      .slice(0, 3);
      
    titleMatches.forEach(poster => {
      suggestions.push({ 
        text: poster.title, 
        type: 'trending' 
      });
    });

    return suggestions.slice(0, 6);
  };

  // Gérer les changements de saisie
  useEffect(() => {
    const results = performSearch(searchTerm);
    setSearchResults(results);
    setSuggestions(generateSuggestions(searchTerm));
    
    // Déclencher la recherche avec un délai
    const timeoutId = setTimeout(() => {
      onSearch(results.map(r => r.poster), searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, posters, categories]);

  // Gérer les clics extérieurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setIsActive(false);
    saveToRecentSearches(suggestion.text);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch(posters, '');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      saveToRecentSearches(searchTerm);
      setIsActive(false);
      inputRef.current?.blur();
    }
  };

  const getMatchTypeIcon = (type: 'title' | 'category' | 'description') => {
    switch (type) {
      case 'category': return '🏷️';
      case 'description': return '📝';
      default: return '🎨';
    }
  };

  const getSuggestionIcon = (type: 'recent' | 'trending' | 'category') => {
    switch (type) {
      case 'recent': return <Clock size={14} className="text-gray-400" />;
      case 'trending': return <TrendingUp size={14} className="text-blue-500" />;
      case 'category': return <span className="text-xs">🏷️</span>;
      default: return <Search size={14} className="text-gray-400" />;
    }
  };

  return (
    <div ref={searchBarRef} className="relative w-full max-w-2xl mx-auto px-4 sm:px-0">
      {/* Barre de recherche principale */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
          border border-gray-200 dark:border-gray-700 transition-all duration-300
          ${isActive ? 'shadow-2xl ring-2 ring-blue-500/20 border-blue-300 dark:border-blue-600' : 'hover:shadow-xl'}
        `}>
          <div className="flex items-center px-4 sm:px-6 py-3 sm:py-4">
            <Search 
              size={18} 
              className={`mr-3 sm:mr-4 transition-colors duration-200 flex-shrink-0 ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`} 
            />
            
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsActive(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base sm:text-lg font-medium min-w-0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 flex-shrink-0"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown des suggestions et résultats */}
      {isActive && (
        <div className="absolute top-full left-4 right-4 sm:left-0 sm:right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] sm:max-h-96 overflow-hidden">
          
          {/* Suggestions */}
          {!searchTerm && suggestions.length > 0 && (
            <div className="p-3 sm:p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Suggestions
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between px-3 py-3 sm:py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate">
                        {suggestion.text}
                      </span>
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                        {suggestion.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Résultats de recherche */}
          {searchTerm && searchResults.length > 0 && (
            <div className="p-3 sm:p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchTerm}"
              </div>
              <div className="space-y-2 max-h-[50vh] sm:max-h-60 overflow-y-auto">
                {searchResults.slice(0, 8).map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      setSearchTerm(result.poster.title);
                      setIsActive(false);
                    }}
                  >
                    <img
                      src={result.poster.image_url}
                      alt={result.poster.title}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                        {result.poster.title}
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex-shrink-0">{getMatchTypeIcon(result.matchType)}</span>
                        <span className="truncate">{result.matchText}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: result.poster.currency || 'EUR'
                      }).format(result.poster.price_cents / 100)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {searchTerm && searchResults.length === 0 && (
            <div className="p-6 sm:p-8 text-center">
              <div className="text-gray-400 mb-3">
                <Search size={40} className="mx-auto opacity-30" />
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Aucun résultat pour "{searchTerm}"
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                Essayez un autre terme ou parcourez nos catégories
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};