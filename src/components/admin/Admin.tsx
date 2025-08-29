@@ .. @@
import { FeaturedPostersManager } from '../admin/FeaturedPostersManager';
import { StorageManager } from '../admin/StorageManager';
import { DebugSupabase } from '../admin/DebugSupabase';
+import { SitemapManager } from '../admin/SitemapManager';
import { DatabaseFixer } from '../admin/DatabaseFixer';
@@ .. @@
-type AdminView = 'posters' | 'categories' | 'featured' | 'storage' | 'debug' | 'setup' | 'fix';
+type AdminView = 'posters' | 'categories' | 'featured' | 'storage' | 'debug' | 'setup' | 'fix' | 'sitemap';
@@ .. @@
              <span className="xs:hidden">Setup</span>
            </button>
            <button
+              onClick={() => setCurrentView('sitemap')}
+              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
+                currentView === 'sitemap'
+                  ? 'bg-purple-600 text-white shadow-md'
+                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
+              }`}
+            >
+              <Database size={16} className="sm:w-[18px] sm:h-[18px]" />
+              <span className="hidden xs:inline">Sitemap</span>
+              <span className="xs:hidden">Map</span>
+            </button>
+            <button
              onClick={() => setCurrentView('fix')}
@@ .. @@
        ) : currentView === 'setup' ? (
          <SupabaseSetup />
        ) : currentView === 'fix' ? (
          <DatabaseFixer />
+        ) : currentView === 'sitemap' ? (
+          <SitemapManager />
        ) : (
</parameter>