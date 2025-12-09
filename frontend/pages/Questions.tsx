import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import { useModal } from '../context/ModalContext';
import { forumService } from '../services/forum';
import { Question } from '../types';
import { useSearchTracking } from '../hooks/useSearchTracking';

const ITEMS_PER_PAGE = 10;

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { openAskQuestionModal } = useModal();
  const { trackSearch } = useSearchTracking('QUESTIONS');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await forumService.getQuestions({
        page: currentPage,
        search: searchTerm,
        filter: filter === 'all' ? undefined : filter
      });
      setQuestions(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [filter, searchTerm, currentPage]);

  // Track search separately with longer debounce (only when user stops typing)
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const trackTimer = setTimeout(() => {
        trackSearch(
          searchTerm,
          {
            filter: filter !== 'all' ? filter : undefined,
            page: currentPage
          },
          totalCount
        );
      }, 800); // 800ms debounce for tracking (user has really stopped typing)
      return () => clearTimeout(trackTimer);
    }
  }, [searchTerm, filter, currentPage, totalCount]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-edu-primary dark:text-white">Entraide Académique</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Posez vos questions ou aidez la communauté.</p>
        </div>
        <button
          onClick={openAskQuestionModal}
          className="bg-edu-secondary hover:bg-edu-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus size={18} />
          <span>Poser une question</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par mots-clés, sujets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-edu-secondary text-edu-primary dark:text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter size={18} className="text-gray-400" />
          {['Tout', 'Non résolu', 'Résolu'].map((f) => {
            const val = f === 'Tout' ? 'all' : f === 'Non résolu' ? 'unsolved' : 'solved';
            return (
              <button
                key={f}
                onClick={() => {
                  setFilter(val as any);
                  setCurrentPage(1); // Reset page on filter change
                }}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === val
                  ? 'bg-edu-secondary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400 px-1">
        {loading ? (
          <span>Chargement...</span>
        ) : (
          <>Affichage de <span className="font-bold text-edu-primary dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à <span className="font-bold text-edu-primary dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> sur {totalCount} questions</>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loader
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-40 animate-pulse"></div>
          ))
        ) : questions.length > 0 ? (
          questions.map(q => <QuestionCard key={q.id} question={q} onAnswerAdded={fetchQuestions} />)
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Aucune question trouvée pour cette recherche.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Questions;