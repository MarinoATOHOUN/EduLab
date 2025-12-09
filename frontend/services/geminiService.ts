import api from './api';

class GeminiService {
  // On considère que c'est configuré si le backend répond (on ne peut pas savoir côté client sans appel)
  // Pour l'UI, on peut retourner true par défaut ou ajouter un endpoint de check status
  isConfigured(): boolean {
    return true;
  }

  async askTutor(question: string, subject: string, level: string, style?: string): Promise<string> {
    try {
      const response = await api.post('ai/tutor/', {
        question,
        subject,
        level,
        style
      });
      return response.data.answer;
    } catch (error) {
      console.error("Erreur Gemini:", error);
      return "Une erreur est survenue lors de la consultation du tuteur virtuel. Vérifiez votre connexion ou réessayez plus tard.";
    }
  }

  async getHistory(): Promise<any[]> {
    try {
      const response = await api.get('ai/history/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();