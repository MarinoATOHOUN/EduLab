import React, { useState } from 'react';
import { ArrowUp, CheckCircle2 } from 'lucide-react';
import { Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services/forum';
import MarkdownContent from './MarkdownContent';

interface Props {
    answer: Answer;
    isQuestionAuthor: boolean;
    onAccept?: () => void;
}

const AnswerCard: React.FC<Props> = ({ answer, isQuestionAuthor, onAccept }) => {
    const [votes, setVotes] = useState(answer.votes);
    const [hasVoted, setHasVoted] = useState(answer.userVote === 1);
    const [isVoting, setIsVoting] = useState(false);
    const [isAccepted, setIsAccepted] = useState(answer.isAccepted);
    const { isAuthenticated } = useAuth();

    const handleVote = async () => {
        if (!isAuthenticated) return;
        if (isVoting) return;

        setIsVoting(true);
        try {
            const result = await forumService.voteAnswer(answer.id, 1);
            setVotes(result.votes);
            setHasVoted(!hasVoted);
        } catch (err) {
            console.error('Failed to vote:', err);
        } finally {
            setIsVoting(false);
        }
    };

    const handleAccept = async () => {
        if (!isQuestionAuthor) return;

        try {
            await forumService.acceptAnswer(answer.id);
            setIsAccepted(true);
            if (onAccept) onAccept();
        } catch (err) {
            console.error('Failed to accept answer:', err);
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${isAccepted ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-start gap-4">
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

                    {isAccepted && (
                        <div className="mt-2 text-green-500" title="Réponse acceptée">
                            <CheckCircle2 size={24} className="fill-green-100" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow">
                    <div className="mb-4 text-gray-800 dark:text-gray-200">
                        <MarkdownContent content={answer.content} />
                    </div>

                    <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>Répondu le {answer.createdAt}</span>
                            {isQuestionAuthor && !isAccepted && (
                                <button
                                    onClick={handleAccept}
                                    className="ml-4 flex items-center gap-1 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    <CheckCircle2 size={16} />
                                    Accepter cette réponse
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 px-3 py-1.5 rounded-lg">
                            <img
                                src={answer.author.avatar}
                                alt={answer.author.name}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{answer.author.name}</span>
                            <span className="text-xs text-gray-400">{answer.author.role === 'MENTOR' ? 'Mentor' : 'Étudiant'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
