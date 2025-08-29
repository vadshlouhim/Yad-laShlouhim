import { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Poster } from '../../types';

interface PosterTableProps {
  posters: Poster[];
  onEdit: (poster: Poster) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (poster: Poster) => void;
}

export const PosterTable = ({ posters, onEdit, onDelete, onTogglePublish }: PosterTableProps) => {
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
      onDelete(id);
    }
  };

  if (posters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune affiche créée pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {posters.map((poster) => (
          <div key={poster.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {poster.image_url ? (
                  <img 
                    src={poster.image_url} 
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">📄</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {poster.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onEdit(poster)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onTogglePublish(poster)}
                      className={`p-1 ${poster.is_published ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {poster.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(poster.id, poster.title)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Prix:</span> {formatPrice(poster.price_cents, poster.currency)}</p>
                  <p><span className="font-medium">Catégorie:</span> {poster.category?.name || 'Aucune'}</p>
                  <p><span className="font-medium">Statut:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      poster.is_published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {poster.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Affiche
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posters.map((poster) => (
              <tr key={poster.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={poster.image_url}
                      alt={poster.title}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMyNi42Mjc0IDI4IDMyIDIyLjYyNzQgMzIgMTZDMzIgOS4zNzI1OCAyNi42Mjc0IDQgMjAgNEMxMy4zNzI2IDQgOCA5LjM3MjU4IDggMTZDOCAyMi42Mjc0IDEzLjM3MjYgMjggMjAgMjhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {poster.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {poster.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {poster.category?.name}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(poster.price_cents, poster.currency)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onTogglePublish(poster)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                      poster.is_published
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {poster.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {poster.is_published ? 'Publié' : 'Brouillon'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(poster)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(poster.id, poster.title)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};