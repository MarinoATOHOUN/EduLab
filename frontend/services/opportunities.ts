import api, { publicApi } from './api';
import { Opportunity, OpportunityType } from '../types';

// Service Opportunities
// Développé par Marino ATOHOUN pour Hypee

const mapType = (type: string): OpportunityType => {
    switch (type) {
        case 'SCHOLARSHIP': return OpportunityType.SCHOLARSHIP;
        case 'CONTEST': return OpportunityType.CONTEST;
        case 'INTERNSHIP': return OpportunityType.INTERNSHIP;
        case 'TRAINING': return OpportunityType.TRAINING;
        default: return OpportunityType.SCHOLARSHIP;
    }
};

const mapOpportunity = (o: any): Opportunity => ({
    id: o.id.toString(),
    title: o.title || '',
    provider: o.provider || '',
    type: mapType(o.type),
    deadline: o.deadline,
    description: o.description || '',
    location: o.location || '',
    image: o.image || '',
    external_link: o.external_link
});

export const opportunityService = {
    // Récupérer les opportunités
    getOpportunities: async (params?: {
        page?: number;
        type?: string;
        search?: string;
    }): Promise<{ count: number; results: Opportunity[] }> => {
        const response = await publicApi.get('opportunities/', { params });
        return {
            count: response.data.count,
            results: response.data.results.map(mapOpportunity)
        };
    },

    // Récupérer une opportunité par ID
    getOpportunity: async (id: string): Promise<Opportunity> => {
        const response = await publicApi.get(`opportunities/${id}/`);
        return mapOpportunity(response.data);
    }
};

