import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { forumService } from '../services/forum';
import { Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import AnswerCard from '../components/AnswerCard';

const QuestionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [qData, aData] = await Promise.all([
                forumService.getQuestion(id),
                forumService.getAnswers(id)
            ]);
            setQuestion(qData);
            setAnswers(aData);

            // Fetch related questions based on tags
            if (qData.tags && qData.tags.length > 0) {
                try {
                    const relatedData = await forumService.getQuestions({
                        page: 1,
                        search: qData.tags[0], // Search by first tag
                        filter: undefined
                    });
                    // Filter out current question and limit to 3
                    const filtered = relatedData.results
                        .filter((q: Question) => q.id !== qData.id)
                        .slice(0, 3);
                    setRelatedQuestions(filtered);
                } catch (err) {
                    console.error('Failed to load related questions:', err);
                }
            }
        } catch (err) {
            console.error('Failed to load question details:', err);
            setError('Impossible de charger la question');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary"></div>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || 'Question introuvable'}</p>
                <button onClick={() => navigate('/questions')} className="text-edu-secondary hover:underline">
                    Retour aux questions
                </button>
            </div>
        );
    }

    const isAuthor = user?.id.toString() === question.author.id;

    return (
        <div className="pb-12 animate-in fade-in duration-300">
            {/* Header with back button */}
            <div className="max-w-6xl mx-auto mb-6">
                <button
                    onClick={() => navigate('/questions')}
                    className="flex items-center gap-2 text-gray-500 hover:text-edu-primary transition-colors"
                >
                    <ChevronLeft size={20} />
                    Retour aux questions
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Question and Answers */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Question Card */}
                    <QuestionCard
                        question={question}
                        onAnswerAdded={fetchData}
                    />

                    {/* Answers Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {answers.length} {answers.length > 1 ? 'Réponses' : 'Réponse'}
                            </h3>
                            {answers.length > 0 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Triées par votes
                                </span>
                            )}
                        </div>

                        {answers.length > 0 ? (
                            <div className="space-y-4">
                                {answers.map(answer => (
                                    <AnswerCard
                                        key={answer.id}
                                        answer={answer}
                                        isQuestionAuthor={isAuthor}
                                        onAccept={fetchData}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucune réponse pour le moment. Soyez le premier à répondre !
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Related Questions and Stats */}
                <div className="space-y-6">
                    {/* Question Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">Statistiques</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Vues</span>
                                <span className="font-bold text-edu-primary dark:text-white">{question.views || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Votes</span>
                                <span className="font-bold text-edu-primary dark:text-white">{question.votes}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Réponses</span>
                                <span className="font-bold text-edu-primary dark:text-white">{answers.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${question.isSolved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {question.isSolved ? 'Résolu' : 'Non résolu'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Related Questions */}
                    {relatedQuestions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb size={20} className="text-edu-secondary" />
                                <h4 className="font-bold text-gray-800 dark:text-white">Questions similaires</h4>
                            </div>
                            <div className="space-y-3">
                                {relatedQuestions.map(q => (
                                    <div
                                        key={q.id}
                                        onClick={() => navigate(`/questions/${q.id}`)}
                                        className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-100 dark:border-gray-700"
                                    >
                                        <h5 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2 mb-2">
                                            {q.title}
                                        </h5>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{q.answers} réponses</span>
                                            <span>{q.votes} votes</span>
                                        </div>
                                        {q.tags && q.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {q.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">Posée par</h4>
                        <div className="flex items-center gap-3">
                            <img
                                src={question.author.avatar}
                                alt={question.author.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-medium text-gray-800 dark:text-white">{question.author.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{question.author.country}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Posée le {question.createdAt}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetail;
