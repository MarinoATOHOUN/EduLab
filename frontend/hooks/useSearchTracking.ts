import { useCallback, useRef } from 'react';
import { analyticsService, SearchLogData } from '../services/analytics';

/**
 * Hook personnalisé pour tracker les recherches
 * 
 * Usage:
 * const { trackSearch, trackClick } = useSearchTracking('QUESTIONS');
 * 
 * // Lors d'une recherche
 * const searchLogId = await trackSearch('python', { status: 'unsolved' }, 15);
 * 
 * // Lors du clic sur un résultat
 * trackClick(searchLogId, questionId, position);
 */
export const useSearchTracking = (category: SearchLogData['category']) => {
    const lastSearchLogId = useRef<number | null>(null);

    const trackSearch = useCallback(async (
        query: string,
        filters?: Record<string, any>,
        resultsCount?: number
    ): Promise<number | null> => {
        if (!query || query.trim().length < 2) {
            return null;
        }

        try {
            const response = await analyticsService.logSearch({
                category,
                search_query: query.trim(),
                filters_applied: filters,
                results_count: resultsCount
            });

            lastSearchLogId.current = response.id;
            return response.id;
        } catch (error) {
            console.error('Failed to track search:', error);
            return null;
        }
    }, [category]);

    const trackClick = useCallback(async (
        searchLogId: number | null,
        resultId: string,
        position: number
    ): Promise<void> => {
        const logId = searchLogId || lastSearchLogId.current;

        if (!logId) {
            return;
        }

        try {
            await analyticsService.logResultClick({
                search_log_id: logId,
                result_id: resultId,
                position
            });
        } catch (error) {
            console.error('Failed to track click:', error);
        }
    }, []);

    return {
        trackSearch,
        trackClick,
        lastSearchLogId: lastSearchLogId.current
    };
};
