import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Loader2, GraduationCap } from 'lucide-react';
import { Opportunity, OpportunityType } from '../types';
import { opportunityService } from '../services';
import { useSearchTracking } from '../hooks/useSearchTracking';

const Opportunities: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackSearch } = useSearchTracking('OPPORTUNITIES');

  const filters = [
    { label: 'Tout', value: 'All' },
    { label: 'Bourses', value: OpportunityType.SCHOLARSHIP },
    { label: 'Concours', value: OpportunityType.CONTEST },
    { label: 'Stages', value: OpportunityType.INTERNSHIP },
    { label: 'Formations', value: OpportunityType.TRAINING },
  ];

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const params: any = {};
        // Note: The backend expects type keys (SCHOLARSHIP), but frontend uses values (Bourse).
        // We need to map back to keys if we filter by API, or just filter locally.
        // For now, let's fetch all and filter locally to match current behavior, 
        // or better, map the filter value back to backend key.
        // Given the small number, local filtering is fine for now.

        const data = await opportunityService.getOpportunities();
        setOpportunities(data.results);
      } catch (error) {
        console.error('Failed to fetch opportunities', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(op =>
    filter === 'All' ? true : op.type === filter
  );

  // Track filter changes
  useEffect(() => {
    if (filter !== 'All') {
      trackSearch(
        filter,
        { type: filter },
        filteredOpportunities.length
      );
    }
  }, [filter, filteredOpportunities.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-edu-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-edu-primary dark:text-white">Opportunités Éducatives</h1>
          <p className="text-gray-500 dark:text-gray-400">Bourses, concours et stages sélectionnés pour vous.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 max-w-full scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${filter === f.value
                ? 'bg-edu-secondary text-white border-edu-secondary shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOpportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map(op => (
            <div key={op.id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                {op.image ? (
                  <img src={op.image} alt={op.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-edu-secondary to-edu-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <GraduationCap size={48} className="text-white/20" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-edu-primary dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {op.type}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="text-xs text-edu-secondary dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider">{op.provider}</div>
                <h3 className="font-bold text-lg text-edu-primary dark:text-white mb-2">{op.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">{op.description}</p>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2 text-edu-accent" />
                    Deadline: <span className="text-edu-primary dark:text-white ml-1 font-medium">{op.deadline}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2 text-edu-accent" />
                    {op.location}
                  </div>
                </div>

                <a
                  href={op.external_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center mt-4 bg-transparent border border-edu-primary dark:border-gray-500 text-edu-primary dark:text-white hover:bg-edu-primary hover:text-white dark:hover:bg-white dark:hover:text-edu-primary py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  Voir les détails
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Aucune opportunité trouvée pour ce filtre.</p>
          <button
            onClick={() => setFilter('All')}
            className="mt-2 text-edu-secondary font-medium hover:underline"
          >
            Voir toutes les opportunités
          </button>
        </div>
      )}
    </div>
  );
};

export default Opportunities;