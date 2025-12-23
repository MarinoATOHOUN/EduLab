import api from './api';

// Service Messagerie
// Développé par Marino ATOHOUN pour Hypee

export interface MessageAttachment {
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
}

export interface Message {
    id: string;
    sender: {
        id: string;
        email: string;
        profile: {
            name: string;
            avatar: string | null;
        };
    };
    content: string | null;
    attachments: MessageAttachment[];
    created_at: string;
    is_encrypted: boolean;
    encrypted_keys?: Record<string, string>;
    is_visible_to_recipient?: boolean;
}

export interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        email: string;
        profile: {
            name: string;
            avatar: string | null;
            public_key?: string;
            encrypted_private_key?: string;
        };
    }>;
    last_message: Message | null;
    unread_count: number;
    last_message_at: string | null;
    created_at: string;
}

// Helper to fix avatar URL
const getAvatarUrl = (avatar: string | null | undefined, name: string) => {
    if (avatar && avatar.startsWith('/media')) {
        return `http://127.0.0.1:8000${avatar}`;
    }
    return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// Helper to map backend conversation
const mapConversation = (c: any): Conversation => ({
    ...c,
    participants: c.participants.map((p: any) => ({
        ...p,
        profile: {
            ...p.profile,
            avatar: getAvatarUrl(p.profile?.avatar, p.profile?.name),
            public_key: p.profile?.public_key,
            encrypted_private_key: p.profile?.encrypted_private_key
        }
    })),
    last_message: c.last_message ? mapMessage(c.last_message) : null
});

// Helper to map backend message
const mapMessage = (m: any): Message => ({
    ...m,
    sender: {
        ...m.sender,
        profile: {
            ...m.sender.profile,
            avatar: getAvatarUrl(m.sender.profile?.avatar, m.sender.profile?.name)
        }
    },
    is_visible_to_recipient: m.is_visible_to_recipient
});

export const messagingService = {
    // Récupérer toutes les conversations
    getConversations: async (): Promise<{ count: number; results: Conversation[] }> => {
        const response = await api.get('conversations/');
        return {
            ...response.data,
            results: response.data.results.map(mapConversation)
        };
    },

    // Récupérer une conversation par ID
    getConversation: async (id: string): Promise<Conversation> => {
        const response = await api.get(`conversations/${id}/`);
        return mapConversation(response.data);
    },

    // Récupérer les messages d'une conversation
    getMessages: async (conversationId: string): Promise<{ count: number; results: Message[] }> => {
        const response = await api.get(`conversations/${conversationId}/messages/`);
        return {
            ...response.data,
            results: response.data.results.map(mapMessage)
        };
    },

    // Envoyer un message
    sendMessage: async (
        conversationId: string,
        content: string,
        attachments?: Array<{
            file_url: string;
            file_name: string;
            file_type: string;
            file_size: number;
        }>,
        isEncrypted: boolean = false,
        encryptedKeys: Record<string, string> = {}
    ): Promise<Message> => {
        const response = await api.post(`conversations/${conversationId}/send_message/`, {
            content,
            attachments: attachments || [],
            is_encrypted: isEncrypted,
            encrypted_keys: encryptedKeys
        });
        return mapMessage(response.data);
    },

    // Créer une nouvelle conversation
    createConversation: async (
        participantIds: string[],
        initialMessage: string
    ): Promise<Conversation> => {
        const response = await api.post('conversations/', {
            participant_ids: participantIds,
            initial_message: initialMessage
        });
        return mapConversation(response.data);
    },

    // Connexion WebSocket
    connectToChat: (conversationId: string, onMessage: (message: Message) => void, user?: { id: string }) => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Utiliser le port 8000 pour le backend Django
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/chat/${conversationId}/?token=${localStorage.getItem('access_token')}`;

        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                const msg = data.message;
                // Filter hidden messages for recipient
                if (msg.sender.id !== user?.id && msg.is_visible_to_recipient === false) {
                    return;
                }
                onMessage(mapMessage(msg));
            }
        };

        socket.onopen = () => {

        };

        socket.onerror = (error) => {
            console.error('WebSocket Error', error);
        };

        return socket;
    },

    // Upload de fichier (simulation pour l'instant)
    uploadFile: async (file: File): Promise<{
        file_url: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }> => {
        // Pour l'instant, on simule l'upload en créant une data URL
        // En production, il faudrait uploader vers S3 ou un serveur de fichiers
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    file_url: reader.result as string,
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size
                });
            };
            reader.readAsDataURL(file);
        });
    }
};
