import api from './api';
import { User, UserRole } from '../types';

// Service d'authentification
// Développé par Marino ATOHOUN pour Hypee

interface AuthResponse {
    user: User;
    tokens: {
        access: string;
        refresh: string;
    };
}

export const authService = {
    // Connexion
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('auth/login/', { email, password });
        return response.data;
    },

    // Inscription
    register: async (name: string, email: string, password: string, role: UserRole, university?: string, country?: string): Promise<AuthResponse> => {
        const response = await api.post('auth/register/', {
            email,
            password,
            password_confirm: password, // Backend expects this
            role,
            name,
            university,
            country
        });
        return response.data;
    },

    // Récupérer l'utilisateur courant
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('auth/me/');
        return response.data;
    },

    // Mettre à jour le profil
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.patch('auth/profile/', data);
        return response.data;
    },

    // Upload avatar
    uploadAvatar: async (file: File): Promise<{ avatar_url: string; message: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('auth/upload-avatar/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Déconnexion (côté client uniquement pour JWT)
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
