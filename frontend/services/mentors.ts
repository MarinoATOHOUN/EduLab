import api from './api';
import { Mentor, User, UserRole } from '../types';

// Service Mentors
// Développé par Marino ATOHOUN pour Hypee

// Helper to fix avatar URL
const getAvatarUrl = (avatar: string | null | undefined, name: string) => {
    if (avatar && avatar.startsWith('/media')) {
        return `http://127.0.0.1:8000${avatar}`;
    }
    return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// Helper to map backend mentor to frontend mentor
const mapMentor = (m: any): Mentor => ({
    id: m.id.toString(),
    user: {
        id: m.user.id.toString(),
        name: m.user.profile?.name || 'Mentor',
        avatar: getAvatarUrl(m.user.profile?.avatar, m.user.profile?.name || 'Mentor'),
        role: m.user.role as UserRole,
        points: m.user.points,
        badges: [],
        university: m.user.profile?.university,
        country: m.user.profile?.country || 'Afrique',
    } as User,
    specialties: m.specialties || [],
    bio: m.bio || '',
    rating: m.rating,
    reviews: m.reviews_count,
    // Le backend retourne 'availabilities' (string formaté) ou 'availability' (ancien champ)
    availability: m.availabilities || m.availability || '',
    socials: m.socials || {}
});

export const mentorService = {
    // Récupérer la liste des mentors
    getMentors: async (params?: {
        page?: number;
        search?: string;
        country?: string;
        specialty?: string;
    }): Promise<{ count: number; results: Mentor[] }> => {
        const response = await api.get('mentors/', { params });
        return {
            count: response.data.count,
            results: response.data.results.map(mapMentor)
        };
    },

    // Récupérer un mentor par ID
    getMentor: async (id: string): Promise<Mentor> => {
        const response = await api.get(`mentors/${id}/`);
        return mapMentor(response.data);
    },

    // Récupérer le profil mentor de l'utilisateur connecté
    getMyMentorProfile: async (): Promise<Mentor> => {
        const response = await api.get('mentors/my_profile/');
        return mapMentor(response.data);
    },

    // Mettre à jour le profil mentor
    updateMyMentorProfile: async (data: Partial<Mentor> & { availabilities?: any[] }): Promise<Mentor> => {
        // Transformation des données pour le backend
        const backendData: any = {
            bio: data.bio,
            specialties: data.specialties
        };

        // Transformer socials object -> list
        if (data.socials) {
            const socialsList = [];
            if (data.socials.linkedin) socialsList.push({ platform: 'LINKEDIN', url: data.socials.linkedin });
            if (data.socials.twitter) socialsList.push({ platform: 'TWITTER', url: data.socials.twitter });
            if (data.socials.website) socialsList.push({ platform: 'WEBSITE', url: data.socials.website });
            backendData.socials = socialsList;
        }

        // Si availabilities est fourni directement (nouvelle méthode structurée)
        if (data.availabilities) {
            backendData.availabilities = data.availabilities;
        }
        // Sinon, fallback sur l'ancienne méthode (string parsing)
        else if (data.availability) {
            const availabilitiesList: any[] = [];
            const slots = data.availability.split(' • ');

            const dayMap: Record<string, string> = {
                'Lundi': 'MONDAY', 'Mardi': 'TUESDAY', 'Mercredi': 'WEDNESDAY',
                'Jeudi': 'THURSDAY', 'Vendredi': 'FRIDAY', 'Samedi': 'SATURDAY', 'Dimanche': 'SUNDAY',
                'Weekends': 'SATURDAY', 'Soirs de semaine': 'MONDAY' // Fallback simpliste
            };

            slots.forEach(slot => {
                // Format: "Lundi : 09:00 - 10:00" ou "12/12/2025 : 09:00 - 10:00"
                const parts = slot.split(' : ');
                if (parts.length >= 2) {
                    let dayStr = parts[0].trim();
                    const timeRange = parts[1].trim();
                    const times = timeRange.split(' - ');

                    if (times.length === 2) {
                        let dayCode = dayMap[dayStr];

                        // Si c'est une date (contient /)
                        if (!dayCode && dayStr.includes('/')) {
                            try {
                                const [d, m, y] = dayStr.split('/').map(Number);
                                const date = new Date(y, m - 1, d);
                                // Format YYYY-MM-DD pour le backend
                                const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                                availabilitiesList.push({
                                    specific_date: dateStr,
                                    start_time: times[0].trim(),
                                    end_time: times[1].trim()
                                });
                                return; // Skip adding as recurring
                            } catch (e) {
                                console.warn('Date invalide:', dayStr);
                            }
                        }

                        if (dayCode) {
                            availabilitiesList.push({
                                day_of_week: dayCode,
                                start_time: times[0].trim(),
                                end_time: times[1].trim()
                            });
                        }
                    }
                }
            });
            backendData.availabilities = availabilitiesList;
        }

        const response = await api.patch('mentors/my_profile/', backendData);
        return mapMentor(response.data);
    },

    // Récupérer les avis d'un mentor
    getMentorReviews: async (id: string): Promise<any[]> => {
        const response = await api.get(`mentors/${id}/reviews/`);
        return response.data.results || response.data;
    },

    // Noter un mentor
    rateMentor: async (id: string, rating: number, comment?: string): Promise<any> => {
        const response = await api.post(`mentors/${id}/rate/`, { rating, comment });
        return response.data;
    },

    // Postuler pour devenir mentor
    apply: async (formData: FormData): Promise<any> => {
        const response = await api.post('mentors/apply/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Récupérer les créneaux disponibles
    getAvailableSlots: async (id: string, startDate?: string, endDate?: string): Promise<Record<string, string[]>> => {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await api.get(`mentors/${id}/available_slots/`, { params });
        return response.data;
    }

};
