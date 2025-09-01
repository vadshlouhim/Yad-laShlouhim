import { Category } from '../../types';
import * as LucideIcons from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Tag;
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onCategoryChange(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
          selectedCategory === null
            ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <LucideIcons.Grid3X3 size={16} />
        Toutes
      </button>

      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
              selectedCategory === category.id
                ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <IconComponent size={16} />
            {category.name}
          </button>
        );
      })}
    </div>
  );
};