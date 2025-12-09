
import api from './api';

export interface LearningTool {
    id: number;
    tool_id: string;
    title: string;
    description: string;
    icon: string;
    category: 'Sciences' | 'Créativité' | 'Langues' | 'Informatique';
    level: 'Primaire' | 'Collège' | 'Lycée' | 'Tous niveaux';
    color: string;
    text_color: string;
    bg_gradient: string;
    status: 'available' | 'dev';
    link: string;
    order: number;
}

export const toolsService = {
    getTools: async (): Promise<LearningTool[]> => {
        const response = await api.get('learning-tools/');
        return response.data.results || response.data;
    }
};
