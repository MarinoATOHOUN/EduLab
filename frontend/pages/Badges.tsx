import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Star, Lock, Filter, Crown, Medal, Edit, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import { useGamification } from '../hooks/useGamification';

const Badges: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'collection' | 'leaderboard'>('collection');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Récupérer les données de gamification depuis l'API
  const { userBadges, allBadges, leaderboard, stats, loading, error } = useGamification();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl text-center max-w-md border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Accès Restreint</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Connectez-vous pour voir vos badges, votre niveau et le classement de la communauté.</p>
          <Link to="/login" className="bg-edu-secondary hover:bg-edu-primary text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg inline-flex items-center gap-2">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-edu-primary animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de vos badges...</p>
      </div>
    );
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl text-center max-w-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Gamification Logic
  const pointsPerLevel = 1000;
  const currentPoints = stats?.points || user.points || 0;
  const currentLevel = stats?.level || Math.floor(currentPoints / pointsPerLevel) + 1;
  const pointsForNextLevel = currentLevel * pointsPerLevel;
  const progressPoints = currentPoints % pointsPerLevel;
  const progressPercentage = (progressPoints / pointsPerLevel) * 100;

  // Récupérer le rang de l'utilisateur
  const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
  const userRank = stats?.rank || leaderboard.findIndex(u => String(u.id) === String(userId)) + 1;

  // Créer un Set des IDs de badges débloqués
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge.id));

  // Filtrer les badges selon le filtre sélectionné
  const filteredBadges = allBadges.filter(badge => {
    const isUnlocked = earnedBadgeIds.has(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  // Mapper les couleurs de badge vers des classes CSS
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'green': 'bg-green-100 dark:bg-green-900/30',
      'blue': 'bg-blue-100 dark:bg-blue-900/30',
      'yellow': 'bg-yellow-100 dark:bg-yellow-900/30',
      'gold': 'bg-yellow-200 dark:bg-yellow-800/30',
      'purple': 'bg-purple-100 dark:bg-purple-900/30',
      'diamond': 'bg-cyan-100 dark:bg-cyan-900/30',
    };
    return colorMap[color] || 'bg-gray-100 dark:bg-gray-800';
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12 space-y-8">

      {/* --- HEADER CARD --- */}
      <div className="bg-gradient-to-r from-edu-primary to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-edu-secondary/50 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => setIsEditProfileModalOpen(true)}>
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-edu-accent object-cover shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-3 -right-2 bg-edu-accent text-edu-primary font-bold px-4 py-1.5 rounded-full border-4 border-edu-primary shadow-sm flex items-center gap-1">
                <Star size={14} className="fill-current" />
                Niv. {currentLevel}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit size={24} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">Bonjour, {user.name.split(' ')[0]} !</h1>
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-200 hover:text-white"
                  title="Modifier le profil"
                >
                  <Edit size={18} />
                </button>
              </div>
              <p className="text-blue-200 max-w-md text-lg">Tu fais partie du top <span className="text-white font-bold">5%</span> de la communauté cette semaine.</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-w-[300px] shadow-lg">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-medium text-blue-200 uppercase tracking-wider">Prochain Niveau</span>
              <span className="font-bold text-2xl">{currentPoints} <span className="text-sm text-blue-300 font-normal">/ {pointsForNextLevel} pts</span></span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-edu-accent to-yellow-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-full bg-white/20 animate-pulse rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-center mt-3 text-blue-200 flex items-center justify-center gap-2">
              <Zap size={14} className="text-yellow-400 fill-yellow-400" />
              Plus que <span className="font-bold text-white">{pointsForNextLevel - currentPoints} pts</span> pour passer niveau {currentLevel + 1} !
            </p>
          </div>
        </div>
      </div>

      {/* --- TABS & NAVIGATION --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'collection' ? 'bg-white dark:bg-gray-700 text-edu-primary dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Trophy size={18} />
            Mes Badges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-white dark:bg-gray-700 text-edu-primary dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Crown size={18} />
            Classement
          </button>
        </div>

        {activeTab === 'collection' && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-edu-secondary focus:border-edu-secondary block px-3 py-2 outline-none"
            >
              <option value="all">Tous les badges</option>
              <option value="unlocked">Débloqués</option>
              <option value="locked">Verrouillés</option>
            </select>
          </div>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === 'collection' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBadges.map(badge => {
              const isEarned = earnedBadgeIds.has(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`relative group rounded-3xl p-6 flex flex-col items-center text-center border-2 transition-all duration-300 ${isEarned
                    ? 'bg-white dark:bg-gray-800 border-transparent hover:border-edu-secondary/30 shadow-sm hover:shadow-xl hover:-translate-y-2'
                    : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 grayscale opacity-70 hover:opacity-90'
                    }`}
                >
                  {!isEarned && (
                    <div className="absolute top-4 right-4 text-gray-400 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm">
                      <Lock size={14} />
                    </div>
                  )}

                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 transition-transform duration-500 ${isEarned ? `${getColorClass(badge.color)} shadow-lg group-hover:scale-110 group-hover:rotate-6` : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                    {badge.icon}
                  </div>

                  <h3 className={`font-bold mb-2 text-sm md:text-base ${isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {badge.name}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {badge.description}
                  </p>

                  <div className={`mt-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isEarned
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {isEarned ? 'Acquis' : 'Verrouillé'}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun badge trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>
      ) : (
        // --- LEADERBOARD TAB ---
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-edu-primary dark:text-white">Top Contributeurs</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Votre rang : <span className="font-bold text-edu-secondary">#{userRank}</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaderboard.map((u, index) => {
                const isCurrentUser = String(u.id) === String(userId);
                const rank = index + 1;

                return (
                  <div
                    key={u.id}
                    className={`p-4 flex items-center gap-4 transition-colors ${isCurrentUser
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-edu-secondary'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      }`}
                  >
                    <div className="w-8 text-center font-bold text-gray-400 shrink-0">
                      {rank === 1 ? <Crown size={24} className="text-yellow-500 mx-auto fill-yellow-500" /> :
                        rank === 2 ? <Medal size={24} className="text-gray-400 mx-auto" /> :
                          rank === 3 ? <Medal size={24} className="text-orange-400 mx-auto" /> :
                            `#${rank}`}
                    </div>

                    <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />

                    <div className="flex-grow">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {u.name}
                        {isCurrentUser && <span className="px-2 py-0.5 bg-edu-secondary text-white text-[10px] rounded-full">Vous</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {u.university || u.country}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-edu-primary dark:text-white text-lg">{u.points.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Points</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} />
    </div>
  );
};

export default Badges;