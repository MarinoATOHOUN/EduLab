import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Link2, Bold, Italic, List } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services';

const AskQuestionModal: React.FC = () => {
  const { isAskQuestionModalOpen, closeAskQuestionModal } = useModal();
  const { gainPoints, unlockBadge } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAskQuestionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les tags (inclure catégorie et niveau)
      const allTags = [
        ...tags,
        category.toLowerCase(),
        level.toLowerCase()
      ].filter(Boolean);

      // Appel API pour créer la question
      const newQuestion = await forumService.createQuestion({
        title,
        content,
        tags: allTags
      });



      // Gamification: Points + Badge
      gainPoints(50); // 50 points pour une question
      unlockBadge('b1'); // Badge "Premier Pas"

      // Notification de succès
      alert('✅ Votre question a été publiée avec succès !');

      // Fermer le modal
      closeAskQuestionModal();

      // Reset form
      setTitle('');
      setCategory('');
      setLevel('');
      setTags([]);
      setTagInput('');
      setContent('');

      // Recharger la page pour voir la nouvelle question
      window.location.reload();
    } catch (err: any) {
      console.error('Erreur lors de la création de la question:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Impossible de publier votre question. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
          <h3 className="font-bold text-lg text-edu-primary dark:text-white">Poser une question à la communauté</h3>
          <button onClick={closeAskQuestionModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2">
              <strong className="font-bold">Erreur: </strong>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Titre de votre question</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white placeholder-gray-400 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ex: Comment implémenter une authentification JWT ?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Matière / Sujet</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white cursor-pointer transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Informatique">Informatique</option>
                <option value="Physique">Physique</option>
                <option value="Biologie">Biologie</option>
                <option value="Économie">Économie</option>
                <option value="Droit">Droit</option>
                <option value="Langues">Langues</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Niveau d'étude</label>
              <select
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white cursor-pointer transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner</option>
                <option value="Secondaire">Secondaire / Lycée</option>
                <option value="Licence">Licence (L1-L3)</option>
                <option value="Master">Master (M1-M2)</option>
                <option value="Doctorat">Doctorat</option>
                <option value="Autre">Autre / Formation Pro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tags (Mots-clés)</label>
            <div className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-edu-secondary transition-shadow flex flex-wrap gap-2 items-center">
              {tags.map(tag => (
                <span key={tag} className="bg-edu-secondary/10 text-edu-secondary dark:text-blue-300 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold animate-in zoom-in duration-200">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors" disabled={isSubmitting}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                disabled={isSubmitting}
                className="flex-grow bg-transparent outline-none min-w-[150px] dark:text-white placeholder-gray-400 h-8 disabled:opacity-50"
                placeholder={tags.length === 0 ? "Ex: algebre, react (Espace pour ajouter)" : ""}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Appuyez sur <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Espace</kbd> pour créer un tag.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Détails</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-edu-secondary transition-shadow bg-white dark:bg-gray-900">
              {/* Toolbar simulation */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-600 p-2 flex gap-1">
                <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" disabled={isSubmitting}><Bold size={16} /></button>
                <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" disabled={isSubmitting}><Italic size={16} /></button>
                <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" disabled={isSubmitting}><List size={16} /></button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" disabled={isSubmitting}><Link2 size={16} /></button>
                <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" disabled={isSubmitting}><ImageIcon size={16} /></button>
              </div>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-4 min-h-[150px] bg-transparent border-none outline-none text-sm dark:text-white resize-none placeholder-gray-400 disabled:opacity-50"
                placeholder="Expliquez votre problème en détail pour obtenir une meilleure réponse..."
              ></textarea>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 pb-2">
            <button
              type="button"
              onClick={closeAskQuestionModal}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-edu-secondary hover:bg-edu-primary rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publication...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;