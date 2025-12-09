
import api from './api';

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    country: string;
    text: string;
    avatar: string | null;
    order: number;
}

export const testimonialService = {
    getTestimonials: async (): Promise<Testimonial[]> => {
        const response = await api.get('testimonials/');
        return response.data.results || response.data;
    }
};
