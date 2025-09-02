import { Poster } from '../types';

const ADMIN_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`;
const AUTH_HEADER = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

interface AdminOperationResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
  message?: string;
}

async function callAdminFunction(operation: string, data?: any): Promise<AdminOperationResponse> {
  try {
    console.log(`🔧 Admin operation: ${operation}`, data);
    
    const response = await fetch(ADMIN_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER
      },
      body: JSON.stringify({ operation, data })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.details || result.error || 'Opération échouée');
    }

    console.log(`✅ Admin operation ${operation} successful:`, result);
    return result;

  } catch (error) {
    console.error(`❌ Admin operation ${operation} failed:`, error);
    throw error;
  }
}

export const adminOperations = {
  // Configuration initiale du storage
  setupStorage: async (): Promise<void> => {
    await callAdminFunction('SETUP_STORAGE');
  },

  // Créer une nouvelle affiche
  createPoster: async (posterData: any): Promise<Poster> => {
    const result = await callAdminFunction('CREATE_POSTER', { posterData });
    return result.data;
  },

  // Modifier une affiche
  updatePoster: async (id: string, posterData: any): Promise<Poster> => {
    const result = await callAdminFunction('UPDATE_POSTER', { id, posterData });
    return result.data;
  },

  // Supprimer une affiche
  deletePoster: async (id: string): Promise<void> => {
    await callAdminFunction('DELETE_POSTER', { id });
  },

  // Basculer le statut de publication
  togglePublished: async (id: string, is_published: boolean): Promise<Poster> => {
    const result = await callAdminFunction('TOGGLE_PUBLISHED', { id, is_published });
    return result.data;
  },

  // Basculer les favoris
  toggleFeatured: async (id: string, is_featured: boolean): Promise<Poster> => {
    const result = await callAdminFunction('TOGGLE_FEATURED', { id, is_featured });
    return result.data;
  },

  // Upload d'image
  uploadImage: async (file: File, fileName: string): Promise<string> => {
    // Pour l'upload, on utilise une approche différente car on ne peut pas sérialiser File en JSON
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('operation', 'UPLOAD_IMAGE');

    const response = await fetch(ADMIN_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER
      },
      body: formData
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.details || result.error || 'Upload échoué');
    }

    return result.url;
  }
};