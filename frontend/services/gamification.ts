import api from './api';

export interface Badge {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface UserBadge {
    id: number;
    badge: Badge;
    awarded_at: string;
}

export interface LeaderboardUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    points: number;
    university?: string;
    country?: string;
}

export interface GamificationStats {
    points: number;
    level: number;
    rank: number;
    total_users: number;
    earned_badges: number;
    total_badges: number;
}

const gamificationService = {
    // Récupérer les badges de l'utilisateur
    getUserBadges: async (): Promise<UserBadge[]> => {
        const response = await api.get('/gamification/my_badges/');
        return response.data;
    },

    // Récupérer tous les badges disponibles
    getAllBadges: async (): Promise<Badge[]> => {
        const response = await api.get('/gamification/all_badges/');
        return response.data;
    },

    // Récupérer le classement (leaderboard)
    getLeaderboard: async (limit: number = 10): Promise<LeaderboardUser[]> => {
        const response = await api.get(`/gamification/leaderboard/?limit=${limit}`);
        const results = response.data.results || response.data;

        return results.map((user: any) => ({
            id: user.id,
            name: user.profile?.name || 'Utilisateur',
            email: user.email,
            avatar: user.profile?.avatar || 'https://ui-avatars.com/api/?name=User',
            points: user.points,
            university: user.profile?.university,
            country: user.profile?.country,
            rank: user.rank,
            badges_count: user.badges_count
        }));
    },

    // Récupérer les statistiques de gamification de l'utilisateur
    getStats: async (): Promise<GamificationStats> => {
        const response = await api.get('/gamification/stats/');
        return response.data;
    },
};

export default gamificationService;
