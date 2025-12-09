import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowUp, CheckCircle2, Bold, Italic, List, Link2, Image as ImageIcon, Send, CornerDownRight } from 'lucide-react';
import { Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services';
import MarkdownContent from './MarkdownContent';

interface Props {
  question: Question;
  onAnswerAdded?: () => void; // Callback pour recharger les questions
}

const QuestionCard: React.FC<Props> = ({ question, onAnswerAdded }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState(question.votes);
  const [hasVoted, setHasVoted] = useState(question.userVote === 1);
  const [isVoting, setIsVoting] = useState(false);

  // Nouveaux états pour la réponse inline
  const [newAnswer, setNewAnswer] = useState<Answer | null>(null);
  const [showNewAnswer, setShowNewAnswer] = useState(false);
  const [answersCount, setAnswersCount] = useState(question.answers);

  const { isAuthenticated, gainPoints, unlockBadge } = useAuth();
  const navigate = useNavigate();

  const handleVote = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const result = await forumService.voteQuestion(question.id, 1);
      setVotes(result.votes);
      setHasVoted(!hasVoted);
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmit = async () => {
    if (!replyContent.trim()) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Appel API pour créer la réponse
      const answer = await forumService.createAnswer(question.id, replyContent);

      // Gamification : Répondre à une question
      gainPoints(20);
      unlockBadge('b2'); // Badge "Savant"

      // Stocker et afficher la réponse localement
      setNewAnswer(answer);
      setShowNewAnswer(true);
      setAnswersCount(prev => prev + 1);

      // Reset formulaire
      setIsReplying(false);
      setReplyContent('');

      // NOTE: On n'appelle PAS onAnswerAdded ici pour éviter le rechargement de la liste
      // qui ferait disparaître notre affichage local de la réponse.

    } catch (err: any) {
      console.error('Erreur lors de la création de la réponse:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Impossible de publier votre réponse. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg min-w-[3rem]">
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`hover:text-edu-accent transition-colors ${hasVoted ? 'text-edu-secondary' : ''} ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp size={20} className={hasVoted ? 'fill-current' : ''} />
          </button>
          <span className="font-bold text-lg">{votes}</span>
        </div>

        {/* Content Section */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3
              onClick={() => navigate(`/questions/${question.id}`)}
              className="text-lg font-semibold text-edu-primary dark:text-white hover:text-edu-secondary cursor-pointer mb-2 line-clamp-2"
            >
              {question.title}
            </h3>
            {question.isSolved && (
              <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-medium shrink-0 ml-2">
                <CheckCircle2 size={12} className="mr-1" />
                Résolu
              </div>
            )}
          </div>

          <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            <MarkdownContent content={question.content} />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-100 dark:border-blue-800">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 gap-4 sm:gap-0">
            <div className="flex items-center space-x-2">
              <img src={question.author.avatar} alt={question.author.name} className="w-5 h-5 rounded-full" />
              <span className="font-medium dark:text-gray-300">{question.author.name}</span>
              <span className="text-gray-300">•</span>
              <span>{question.author.country}</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{question.createdAt}</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate(`/questions/${question.id}`)}
                className="flex items-center space-x-1 cursor-pointer hover:text-edu-secondary transition-colors"
              >
                <MessageSquare size={14} />
                <span>{answersCount} réponses</span>
              </div>
              <button
                onClick={() => setIsReplying(!isReplying)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${isReplying ? 'bg-edu-secondary text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              >
                <CornerDownRight size={14} />
                Répondre
              </button>
            </div>
          </div>

          {/* WYSIWYG Editor Area */}
          {isReplying && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-3 animate-in slide-in-from-top-2">
                  <strong className="font-bold">Erreur: </strong>
                  <span>{error}</span>
                </div>
              )}

              <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-edu-secondary/50 transition-all shadow-sm">
                {/* Toolbar */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 flex gap-1 border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
                  <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="Gras" disabled={isSubmitting}><Bold size={16} /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="Italique" disabled={isSubmitting}><Italic size={16} /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="Liste" disabled={isSubmitting}><List size={16} /></button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="Lien" disabled={isSubmitting}><Link2 size={16} /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="Image" disabled={isSubmitting}><ImageIcon size={16} /></button>
                </div>

                {/* Textarea */}
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Écrivez votre réponse ici. Soyez précis et bienveillant..."
                  className="w-full p-4 min-h-[120px] bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => { setIsReplying(false); setError(null); }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-edu-secondary hover:bg-edu-primary rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Publier la réponse
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Affichage de la nouvelle réponse */}
          {newAnswer && showNewAnswer && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-edu-primary dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Votre réponse
                </h4>
                <button
                  onClick={() => setShowNewAnswer(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                >
                  Masquer
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <img src={newAnswer.author.avatar} alt={newAnswer.author.name} className="w-6 h-6 rounded-full" />
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{newAnswer.author.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">• À l'instant</span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                  <MarkdownContent content={newAnswer.content} />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => navigate(`/questions/${question.id}`)}
                    className="text-xs font-medium text-edu-secondary hover:text-edu-primary transition-colors"
                  >
                    Voir toutes les réponses →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton pour réafficher la réponse si elle est masquée */}
          {newAnswer && !showNewAnswer && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowNewAnswer(true)}
                className="text-xs font-medium text-gray-500 hover:text-edu-secondary transition-colors flex items-center gap-1"
              >
                <CornerDownRight size={12} />
                Afficher votre réponse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;