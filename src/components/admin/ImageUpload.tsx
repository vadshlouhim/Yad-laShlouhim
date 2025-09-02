import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
  bucketName?: string;
}

export const ImageUpload = ({ onImageUploaded, currentImageUrl, className = '' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `poster_${timestamp}_${randomString}.${extension}`;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = generateFileName(file.name);
    const filePath = fileName; // Pas de sous-dossier pour simplifier

    if (!supabase) {
      throw new Error('Supabase n\'est pas configuré. Vérifiez les variables d\'environnement.');
    }

    console.log('📤 Upload vers Supabase Storage:', { fileName, fileSize: file.size });

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('Affiches')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload:', error);
      throw new Error(`Erreur d'upload: ${error.message}`);
    }

    console.log('✅ Upload réussi:', data);

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('Affiches')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL publique');
    }

    console.log('🔗 URL publique générée:', urlData.publicUrl);
    return urlData.publicUrl;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('L\'image ne doit pas dépasser 10MB');
      }

      // Créer un aperçu local
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload vers Supabase
      const imageUrl = await uploadImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Nettoyer l'URL locale et utiliser l'URL Supabase
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(imageUrl);
      
      // Notifier le parent
      onImageUploaded(imageUrl);

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Erreur upload:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setError(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone d'upload */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : uploading
            ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
            : error
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600 animate-bounce" />
            </div>
            <div>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                Upload en cours...
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                Erreur d'upload
              </p>
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            </div>
            <Button
              onClick={() => setError(null)}
              variant="outline"
              size="sm"
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Glissez une image ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, WEBP jusqu'à 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Aperçu de l'image */}
      {previewUrl && (
        <div className="relative">
          <div className="relative aspect-[4/5] max-w-xs mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
              title="Supprimer l'image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {previewUrl.includes('supabase') && (
            <div className="flex items-center justify-center gap-2 mt-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Image uploadée avec succès</span>
            </div>
          )}
        </div>
      )}

      {/* URL de l'image (pour debug) */}
      {previewUrl && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">URL de l'image:</p>
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            {previewUrl}
          </p>
        </div>
      )}
    </div>
  );
};
