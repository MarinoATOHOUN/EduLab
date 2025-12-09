import { useState, useEffect } from 'react';
import gamificationService, { Badge, UserBadge, LeaderboardUser, GamificationStats } from '../services/gamification';

export const useGamification = () => {
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserBadges = async () => {
        try {
            const badges = await gamificationService.getUserBadges();
            setUserBadges(badges);
        } catch (err: any) {
            console.error('Error fetching user badges:', err);
            setError(err.message || 'Failed to fetch user badges');
        }
    };

    const fetchAllBadges = async () => {
        try {
            const badges = await gamificationService.getAllBadges();
            setAllBadges(badges);
        } catch (err: any) {
            console.error('Error fetching all badges:', err);
            setError(err.message || 'Failed to fetch all badges');
        }
    };

    const fetchLeaderboard = async (limit: number = 10) => {
        try {
            const data = await gamificationService.getLeaderboard(limit);
            setLeaderboard(data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            setError(err.message || 'Failed to fetch leaderboard');
        }
    };

    const fetchStats = async () => {
        try {
            const data = await gamificationService.getStats();
            setStats(data);
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            setError(err.message || 'Failed to fetch stats');
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchUserBadges(),
                fetchAllBadges(),
                fetchLeaderboard(),
                fetchStats(),
            ]);
        } catch (err: any) {
            console.error('Error fetching gamification data:', err);
            setError(err.message || 'Failed to fetch gamification data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        userBadges,
        allBadges,
        leaderboard,
        stats,
        loading,
        error,
        refetch: fetchAll,
        fetchUserBadges,
        fetchAllBadges,
        fetchLeaderboard,
        fetchStats,
    };
};
