import { useState, useEffect } from 'react';
import { Folder, Image, Trash2, RefreshCw, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { ImageUpload } from './ImageUpload';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at?: string;
  metadata?: any;
}

export const StorageManager = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [bucketName, setBucketName] = useState<string>('Affiches');

  useEffect(() => {
    checkBucketAndLoadFiles();
  }, []);

  const checkBucketAndLoadFiles = async () => {
    try {
      console.log('=== DEBUT DEBUG STORAGE MANAGER ===');
      
      // Vérifier si le bucket existe
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      console.log('Buckets disponibles:', buckets);
      console.log('Erreur buckets:', bucketError);
      
      if (bucketError) {
        console.error('Erreur lors de la vérification des buckets:', bucketError);
        setBucketExists(false);
        return;
      }

      // Chercher le bucket "Affiches" (avec différentes casses possibles)
      const afficheBucket = buckets?.find(bucket => 
        bucket.id === 'Affiches' || 
        bucket.id === 'affiches' ||
        bucket.name === 'Affiches' ||
        bucket.name === 'affiches'
      );
      
      console.log('Bucket Affiches trouvé:', afficheBucket);
      console.log('Tous les buckets:', buckets?.map(b => ({ id: b.id, name: b.name })));
      
      setBucketExists(!!afficheBucket);

      if (!afficheBucket) {
        console.log('❌ Bucket "Affiches" non trouvé. Buckets disponibles:', buckets?.map(b => b.id));
        setFiles([]);
        return;
      }

      // Charger les fichiers (utiliser le nom trouvé)
      const foundBucketName = afficheBucket.id;
      setBucketName(foundBucketName);
      
      console.log('🔍 Chargement des fichiers du bucket:', foundBucketName);
      
      const { data: filesData, error: filesError } = await supabase.storage
        .from(foundBucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      console.log('Fichiers bruts reçus:', filesData);
      console.log('Erreur fichiers:', filesError);

      if (filesError) {
        console.error('❌ Erreur lors du chargement des fichiers:', filesError);
        alert(`Erreur lors du chargement des fichiers: ${filesError.message}`);
        return;
      }

      // Filtrer les fichiers pour ne garder que les images
      const imageFiles = (filesData || []).filter(file => {
        const isImage = file.metadata?.mimetype?.startsWith('image/') || 
                       file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        console.log(`Fichier ${file.name}: isImage=${isImage}, mimetype=${file.metadata?.mimetype}`);
        return isImage;
      });

      console.log('✅ Fichiers images filtrés:', imageFiles);
      console.log(`📊 Total: ${imageFiles.length} images sur ${filesData?.length || 0} fichiers`);
      
      setFiles(imageFiles);
      console.log('=== FIN DEBUG STORAGE MANAGER ===');
      
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setBucketExists(false);
    } finally {
      setLoading(false);
    }
  };

  const createBucket = async () => {
    try {
      const { error } = await supabase.storage.createBucket('Affiches', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('Erreur création bucket:', error);
        alert(`Erreur lors de la création: ${error.message}`);
        return;
      }

      setBucketExists(true);
      checkBucketAndLoadFiles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du bucket');
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!confirm(`Supprimer définitivement "${fileName}" ?`)) return;

    setDeleting(fileName);
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        console.error('Erreur suppression:', error);
        alert(`Erreur lors de la suppression: ${error.message}`);
        return;
      }

      // Recharger la liste
      checkBucketAndLoadFiles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyUrlToClipboard = (fileName: string) => {
    const url = getFileUrl(fileName);
    navigator.clipboard.writeText(url);
    alert('URL copiée dans le presse-papiers !');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (bucketExists === false) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Folder className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionnaire de Fichiers
          </h2>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
            <Folder className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Bucket "Affiches" non configuré
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Le bucket de stockage pour les affiches n'existe pas encore. 
            Créez-le pour pouvoir uploader des images.
          </p>
          <Button
            onClick={createBucket}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Créer le bucket "Affiches"
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionnaire de Fichiers
          </h2>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-md">
            Bucket: {bucketName}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => console.log('Bucket State:', { bucketName, bucketExists, filesCount: files.length })}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Debug
          </Button>
          <Button
            onClick={checkBucketAndLoadFiles}
            variant="outline"
            icon={RefreshCw}
            disabled={loading}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Zone d'upload rapide */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload rapide
        </h3>
        <ImageUpload
          onImageUploaded={(url) => {
            console.log('Image uploadée:', url);
            checkBucketAndLoadFiles();
          }}
          className="max-w-md"
        />
      </div>

      {/* Liste des fichiers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Fichiers dans le bucket ({files.length})
        </h3>

        {files.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Aucune image trouvée dans le bucket "{bucketName}"
            </p>
            <p className="text-xs text-gray-400">
              Vérifiez la console pour plus de détails
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                {/* Aperçu de l'image */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getFileUrl(file.name)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(file.created_at)}
                    {file.metadata?.size && ` • ${formatFileSize(file.metadata.size)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyUrlToClipboard(file.name)}
                    variant="outline"
                    size="sm"
                    title="Copier l'URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => deleteFile(file.name)}
                    variant="outline"
                    size="sm"
                    disabled={deleting === file.name}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/10"
                    title="Supprimer"
                  >
                    {deleting === file.name ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
