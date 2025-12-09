import api from './api';
import { Notification } from '../types';

// Service Notifications
// Développé par Marino ATOHOUN pour Hypee

const mapNotification = (n: any): Notification => ({
    id: n.id.toString(),
    userId: n.user_id ? n.user_id.toString() : '',
    title: n.title || '',
    message: n.message || '',
    type: n.type as 'SYSTEM' | 'REPLY' | 'MENTORSHIP' | 'ACHIEVEMENT',
    createdAt: new Date(n.created_at).toLocaleDateString(),
    isRead: n.is_read,
    link: n.link
});

export const notificationService = {
    // Récupérer les notifications
    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get('notifications/');
        return response.data.results?.map(mapNotification) || [];
    },

    // Marquer une notification comme lue
    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`notifications/${id}/mark_read/`);
    },

    // Marquer toutes les notifications comme lues
    markAllAsRead: async (): Promise<void> => {
        await api.post('notifications/mark_all_read/');
    },

    // Supprimer une notification
    deleteNotification: async (id: string): Promise<void> => {
        await api.delete(`notifications/${id}/`);
    },

    // Connexion WebSocket pour les notifications
    connectToNotifications: (onNotification: (notification: Notification) => void) => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/notifications/?token=${localStorage.getItem('access_token')}`;

        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification' && data.notification) {
                onNotification(mapNotification(data.notification));
            }
        };

        socket.onopen = () => {

        };

        socket.onerror = (error) => {
            console.error('Notification WebSocket Error', error);
        };

        return socket;
    }
};
