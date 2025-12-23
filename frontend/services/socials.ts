import api, { publicApi } from './api';

export interface SocialLink {
    id: number;
    platform: string;
    name: string;
    url: string;
    icon: string;
    order: number;
}

export const socialLinkService = {
    getSocialLinks: async (): Promise<SocialLink[]> => {
        const response = await publicApi.get('social-links/');
        return response.data.results || response.data;
    }
};

