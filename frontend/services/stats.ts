import api, { publicApi } from './api';

export interface PlatformStats {
    active_students: number;
    solved_questions: number;
    expert_mentors: number;
    practical_tools: number;
}

export interface ImpactStat {
    id: number;
    title: string;
    value: string;
    icon: string;
    description: string;
    order: number;
}

export const statsService = {
    /**
     * Récupérer les statistiques de la plateforme
     */
    getPlatformStats: async (): Promise<PlatformStats> => {
        const response = await publicApi.get('stats/');
        return response.data;
    },

    /**
     * Récupérer les statistiques d'impact configurables
     */
    getImpactStats: async (): Promise<ImpactStat[]> => {
        const response = await publicApi.get('impact-stats/');
        // L'API retourne une liste paginée par défaut avec DRF, donc results
        return response.data.results || response.data;
    }
};

