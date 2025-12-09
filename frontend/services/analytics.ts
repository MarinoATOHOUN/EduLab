import api from './api';

export interface SearchLogData {
    category: 'QUESTIONS' | 'MENTORS' | 'OPPORTUNITIES' | 'TOOLS' | 'USERS' | 'GENERAL';
    search_query: string;
    filters_applied?: Record<string, any>;
    results_count?: number;
}

export interface ResultClickData {
    search_log_id: number;
    result_id: string;
    position: number;
}

export interface PopularSearch {
    category: string;
    search_query: string;
    search_count: number;
    last_searched: string;
}

export const analyticsService = {
    /**
     * Enregistrer une recherche
     */
    logSearch: async (data: SearchLogData): Promise<{ id: number }> => {
        const response = await api.post('analytics/search-log/', data);
        return response.data;
    },

    /**
     * Enregistrer le clic sur un résultat
     */
    logResultClick: async (data: ResultClickData): Promise<void> => {
        await api.post('analytics/result-click/', data);
    },

    /**
     * Récupérer les recherches populaires
     */
    getPopularSearches: async (category?: string, limit: number = 10): Promise<PopularSearch[]> => {
        const params: any = { limit };
        if (category) params.category = category;

        const response = await api.get('analytics/popular-searches/', { params });
        return response.data;
    },

    /**
     * Récupérer les recherches tendances
     */
    getTrendingSearches: async (category?: string, days: number = 7, limit: number = 10): Promise<Array<{ search_query: string; count: number }>> => {
        const params: any = { days, limit };
        if (category) params.category = category;

        const response = await api.get('analytics/trending-searches/', { params });
        return response.data;
    }
};
