import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, User, Search, SlidersHorizontal, Filter, Award, PlusCircle, Heart } from 'lucide-react';
import { mentorService } from '../services';
import { Mentor, UserRole } from '../types';
import BecomeMentorModal from '../components/BecomeMentorModal';
import { useAuth } from '../context/AuthContext';
import { useSearchTracking } from '../hooks/useSearchTracking';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews'
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { trackSearch } = useSearchTracking('MENTORS');

  // États pour les données de l'API
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les mentors depuis l'API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await mentorService.getMentors();
        setMentors(data.results);
      } catch (err) {
        console.error('Failed to load mentors:', err);
        setError('Impossible de charger les mentors');
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  // Extract unique options for dropdowns with counts
  const countryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    mentors.forEach(m => {
      const country = m.user.country || 'Autre';
      stats[country] = (stats[country] || 0) + 1;
    });
    return stats;
  }, [mentors]);

  const countries = useMemo(() => {
    return Object.entries(countryStats).sort((a, b) => a[0].localeCompare(b[0]));
  }, [countryStats]);

  const specialties = useMemo(() => {
    const unique = new Set(mentors.flatMap(m => m.specialties || []));
    return ['All', ...Array.from(unique).sort()];
  }, [mentors]);

  // Filter and Sort Logic
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const matchesSearch = mentor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.bio || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'All' || mentor.user.country === selectedCountry;
      const matchesSpecialty = selectedSpecialty === 'All' || (mentor.specialties || []).includes(selectedSpecialty);

      return matchesSearch && matchesCountry && matchesSpecialty;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0);
      return 0;
    });
  }, [mentors, searchTerm, selectedCountry, selectedSpecialty, sortBy]);

  // Track search with debounce (only when user stops typing)
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timer = setTimeout(() => {
        trackSearch(
          searchTerm,
          {
            country: selectedCountry !== 'All' ? selectedCountry : undefined,
            specialty: selectedSpecialty !== 'All' ? selectedSpecialty : undefined,
            sortBy
          },
          filteredMentors.length
        );
      }, 800); // 800ms debounce - user has really stopped typing
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedCountry, selectedSpecialty, sortBy, filteredMentors.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des mentors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-edu-secondary text-white px-6 py-2 rounded-full hover:bg-edu-primary transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Become Mentor Action */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-edu-primary to-edu-secondary p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Trouvez votre Mentor</h1>
          <p className="text-blue-100 text-lg">Connectez-vous avec des experts académiques et professionnels de toute l'Afrique pour booster votre carrière.</p>
        </div>

        <div className="relative z-10">
          {(!user || (user.role !== UserRole.MENTOR && user.mentor_application_status !== 'PENDING')) && (
            <button
              onClick={() => setIsMentorModalOpen(true)}
              className="bg-edu-accent text-edu-primary px-6 py-3 rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle size={20} />
              Devenir Mentor
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-grow md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un mentor par nom..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-edu-secondary text-edu-primary dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap md:flex-nowrap gap-3">
            <div className="relative min-w-[160px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-edu-secondary text-edu-primary dark:text-white cursor-pointer"
              >
                <option value="All">Tous les pays</option>
                {countries.map(([country, count]) => (
                  <option key={country} value={country}>
                    {country} ({count})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-edu-secondary text-edu-primary dark:text-white cursor-pointer"
              >
                <option value="All">Toutes matières</option>
                {specialties.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[160px]">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-edu-secondary text-edu-primary dark:text-white cursor-pointer"
              >
                <option value="rating">Mieux notés</option>
                <option value="reviews">Plus d'avis</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredMentors.length > 0 ? (
          filteredMentors.map(mentor => (
            <div key={mentor.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <Link to={`/mentors/${mentor.id}`} className="flex items-center gap-4 group">
                  <div className="relative">
                    <img src={mentor.user.avatar} alt={mentor.user.name} className="w-16 h-16 rounded-full border-2 border-edu-accent object-cover group-hover:border-edu-secondary transition-colors" />
                    {isAuthenticated && mentor.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" title="En ligne"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-edu-primary dark:text-white group-hover:text-edu-secondary transition-colors">{mentor.user.name}</h3>
                    <p className="text-sm text-edu-secondary dark:text-blue-300 font-medium">{mentor.user.university || 'Université'}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin size={12} className="mr-1" />
                      {mentor.user.country || 'Afrique'}
                    </div>
                  </div>
                </Link>
                <div className="flex flex-col items-end">
                  <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-yellow-700 dark:text-yellow-500 text-sm font-bold">
                    <Star size={14} className="mr-1 fill-current" />
                    {mentor.rating || 0}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{mentor.reviews || 0} avis</span>
                </div>
              </div>

              <div className="space-y-3 flex-grow">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Spécialités</p>
                  <div className="flex flex-wrap gap-2">
                    {(mentor.specialties || []).map(s => (
                      <span key={s} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{mentor.bio || 'Pas de bio disponible'}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-700 mt-4">
                <div>
                  <div className="text-xs text-gray-400">Statut</div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Heart size={12} className="fill-current" />
                    Bénévole
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/mentors/${mentor.id}`}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <User size={16} />
                    Voir profil
                  </Link>
                  <Link
                    to={`/mentors/${mentor.id}`}
                    className="flex items-center gap-2 bg-edu-primary hover:bg-edu-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Calendar size={16} />
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun mentor ne correspond à vos critères.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCountry('All'); setSelectedSpecialty('All'); }}
              className="mt-2 text-edu-secondary font-medium hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal Component */}
      <BecomeMentorModal isOpen={isMentorModalOpen} onClose={() => setIsMentorModalOpen(false)} />
    </div>
  );
};

export default Mentors;