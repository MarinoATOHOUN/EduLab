import api from './api';
import { User } from '../types';

// Service Réservations
// Développé par Marino ATOHOUN pour Hypee

export interface Booking {
    id: string;
    student: User;
    mentor: User;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    status_label: string;
    domains: string[];
    expectation: string;
    main_question: string;
    created_at: string;
}

// Helper to fix avatar URL (reused logic)
const getAvatarUrl = (avatar: string | null | undefined, name: string) => {
    if (avatar && avatar.startsWith('/media')) {
        return `http://127.0.0.1:8000${avatar}`;
    }
    return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// Helper to map backend booking to frontend booking
const mapBooking = (b: any): Booking => {
    const statusLabels: Record<string, string> = {
        'PENDING': 'En attente',
        'CONFIRMED': 'Confirmé',
        'REJECTED': 'Refusé',
        'COMPLETED': 'Terminé',
        'CANCELLED': 'Annulé'
    };

    return {
        id: b.id ? b.id.toString() : '',
        student: {
            ...b.student,
            id: b.student?.id ? b.student.id.toString() : '',
            name: b.student?.profile?.name || 'Étudiant',
            avatar: getAvatarUrl(b.student?.profile?.avatar, b.student?.profile?.name),
        },
        mentor: {
            ...b.mentor,
            id: b.mentor?.id ? b.mentor.id.toString() : '',
            name: b.mentor?.profile?.name || 'Mentor',
            avatar: getAvatarUrl(b.mentor?.profile?.avatar, b.mentor?.profile?.name),
        },
        date: b.date,
        time: b.time,
        status: b.status,
        status_label: statusLabels[b.status] || b.status,
        domains: Array.isArray(b.domains) ? b.domains : [],
        expectation: b.expectation || '',
        main_question: b.main_question || '',
        created_at: b.created_at
    };
};

export const bookingsService = {
    // Récupérer mes réservations
    getBookings: async (params?: { status?: string }): Promise<Booking[]> => {
        const response = await api.get('bookings/', { params });
        const results = response.data.results || response.data;
        return results.map(mapBooking);
    },

    // Créer une réservation
    createBooking: async (data: {
        mentor_id: string;
        date: string;
        time: string;
        domains: string[];
        expectations: string;
        main_questions: string;
    }): Promise<Booking> => {
        const response = await api.post('bookings/', data);
        return mapBooking(response.data);
    },

    // Annuler une réservation (suppression logique)
    cancelBooking: async (id: string): Promise<void> => {
        await api.delete(`bookings/${id}/`);
    },

    // Mettre à jour le statut (pour les mentors)
    updateBookingStatus: async (id: string, status: string, reason?: string): Promise<Booking> => {
        const response = await api.patch(`bookings/${id}/update_status/`, { status, reason });
        return mapBooking(response.data);
    },

    // Récupérer les demandes pour les mentors
    getMentorRequests: async (): Promise<Booking[]> => {
        const response = await api.get('bookings/mentor_requests/');
        // Handle pagination or list
        const results = response.data.results || response.data;
        return results.map(mapBooking);
    }
};
