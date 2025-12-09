import api from './api';
import { Question, Answer, User, UserRole } from '../types';

// Service Forum
// Développé par Marino ATOHOUN pour Hypee

interface QuestionListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[]; // Raw backend data
}

// Helper to fix avatar URL
const getAvatarUrl = (avatar: string | null | undefined, name: string) => {
    if (avatar && avatar.startsWith('/media')) {
        return `http://127.0.0.1:8000${avatar}`;
    }
    return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// Helper to map backend question to frontend question
const mapQuestion = (q: any): Question => ({
    id: q.id.toString(),
    author: {
        id: q.author.id.toString(),
        name: q.author.profile?.name || 'Utilisateur',
        avatar: getAvatarUrl(q.author.profile?.avatar, q.author.profile?.name || 'User'),
        role: q.author.role as UserRole,
        points: q.author.points,
        badges: [],
        university: q.author.profile?.university,
        country: q.author.profile?.country || 'Afrique',
    } as User,
    title: q.title,
    content: q.content,
    tags: q.tags,
    votes: q.votes,
    answers: q.answers_count,
    createdAt: new Date(q.created_at).toLocaleDateString(),
    isSolved: q.is_solved,
    userVote: q.user_vote || null
});

// Helper to map backend answer to frontend answer
const mapAnswer = (a: any): Answer => ({
    id: a.id.toString(),
    questionId: a.question.toString(),
    author: {
        id: a.author.id.toString(),
        name: a.author.profile?.name || 'Utilisateur',
        avatar: getAvatarUrl(a.author.profile?.avatar, a.author.profile?.name || 'User'),
        role: a.author.role as UserRole,
        points: a.author.points,
        badges: [],
        university: a.author.profile?.university,
        country: a.author.profile?.country || 'Afrique',
    } as User,
    content: a.content,
    votes: a.votes,
    isAccepted: a.is_accepted,
    createdAt: new Date(a.created_at).toLocaleDateString(),
    userVote: a.user_vote || null
});

export const forumService = {
    // Récupérer les questions avec filtres
    getQuestions: async (params?: {
        page?: number;
        search?: string;
        filter?: 'solved' | 'unsolved';
        tag?: string
    }): Promise<{ count: number; results: Question[] }> => {
        const response = await api.get('forum/questions/', { params });
        return {
            count: response.data.count,
            results: response.data.results.map(mapQuestion)
        };
    },

    // Récupérer une question par ID
    getQuestion: async (id: string): Promise<Question> => {
        const response = await api.get(`forum/questions/${id}/`);
        return mapQuestion(response.data);
    },

    // Créer une question
    createQuestion: async (data: { title: string; content: string; tags: string[] }): Promise<Question> => {
        const response = await api.post('forum/questions/', data);
        return mapQuestion(response.data);
    },

    // Voter pour une question
    voteQuestion: async (id: string, voteType: 1 | -1): Promise<{ votes: number }> => {
        const response = await api.post(`forum/questions/${id}/vote/`, { vote_type: voteType });
        return response.data;
    },

    // Récupérer les réponses d'une question
    getAnswers: async (questionId: string): Promise<Answer[]> => {
        const response = await api.get(`forum/questions/${questionId}/answers/`);
        return response.data.map(mapAnswer);
    },

    // Créer une réponse à une question
    createAnswer: async (questionId: string, content: string): Promise<Answer> => {
        const response = await api.post(`forum/questions/${questionId}/answers/`, { content });
        return mapAnswer(response.data);
    },

    // Voter pour une réponse
    voteAnswer: async (id: string, voteType: 1 | -1): Promise<{ votes: number }> => {
        const response = await api.post(`forum/answers/${id}/vote/`, { vote_type: voteType });
        return response.data;
    },

    // Accepter une réponse
    acceptAnswer: async (id: string): Promise<void> => {
        await api.post(`forum/answers/${id}/accept/`);
    }
};
