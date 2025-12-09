import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Award, Sparkles, CheckCircle, Zap, MessageCircle, Star, Brain, UserPlus, GraduationCap, Wrench } from 'lucide-react';
import { MOCK_QUESTIONS, MOCK_MENTORS, MOCK_OPPORTUNITIES } from '../constants';
import QuestionCard from '../components/QuestionCard';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { statsService, ImpactStat } from '../services/stats';
import { testimonialService, Testimonial } from '../services/testimonials';
import { opportunityService } from '../services/opportunities';
import { forumService } from '../services/forum';
import { Opportunity, Question } from '../types';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users': return <Users className="text-blue-500" size={24} />;
    case 'CheckCircle': return <CheckCircle className="text-green-500" size={24} />;
    case 'Award': return <Award className="text-purple-500" size={24} />;
    case 'Wrench': return <Wrench className="text-edu-accent" size={24} />;
    case 'GraduationCap': return <GraduationCap className="text-blue-500" size={24} />;
    default: return <Star className="text-yellow-500" size={24} />;
  }
};

const Home: React.FC = () => {
  const { openAskQuestionModal } = useModal();
  const { user } = useAuth();

  const [impactStats, setImpactStats] = useState<ImpactStat[]>([]);
  const [loadingImpactStats, setLoadingImpactStats] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [featuredOpportunity, setFeaturedOpportunity] = useState<Opportunity | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Impact Stats
        const statsData = await statsService.getImpactStats();
        setImpactStats(statsData);
      } catch (error) {
        console.error('Failed to fetch impact stats:', error);
      } finally {
        setLoadingImpactStats(false);
      }

      try {
        // Fetch Testimonials
        const testimonialsData = await testimonialService.getTestimonials();
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setLoadingTestimonials(false);
      }

      if (user) {
        try {
          // Fetch Featured Opportunity
          const opps = await opportunityService.getOpportunities({ page: 1 });
          if (opps.results.length > 0) {
            // Prefer featured ones if API supports sorting by featured, otherwise just take first
            // The backend default ordering is ['-is_featured', 'deadline'], so the first one IS the most featured/urgent.
            setFeaturedOpportunity(opps.results[0]);
          }
        } catch (error) {
          console.error('Failed to fetch opportunities:', error);
          setFeaturedOpportunity(MOCK_OPPORTUNITIES[0]);
        }
      } else {
        setFeaturedOpportunity(MOCK_OPPORTUNITIES[0]);
      }

      if (user) {
        try {
          // Fetch Questions
          const questionsData = await forumService.getQuestions({ page: 1 });
          setQuestions(questionsData.results.slice(0, 2));
        } catch (error) {
          console.error('Failed to fetch questions:', error);
          // Fallback to mock if fetch fails
          setQuestions(MOCK_QUESTIONS.slice(0, 2));
        }
      } else {
        setQuestions(MOCK_QUESTIONS.slice(0, 2));
      }
      setLoadingQuestions(false);
    };

    fetchData();
  }, [user]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return `${num}+`;
  };

  return (
    <div className="space-y-16 pb-12 animate-in fade-in duration-500">

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-br from-edu-primary via-[#0f2540] to-edu-secondary rounded-3xl p-8 md:p-16 text-white overflow-hidden shadow-2xl">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-edu-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>
        <div className="absolute top-10 right-10 opacity-20 animate-pulse">
          <Sparkles size={48} className="text-edu-accent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-edu-accent mb-6 backdrop-blur-md">
            <span className="font-bold">Une création Hypee (Bénin)</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Passez enfin de la Théorie <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-edu-accent to-yellow-200">à la Pratique</span>
          </h1>

          <p className="text-blue-100 mb-10 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Le système éducatif vous donne les bases, nous vous donnons les outils.
            Rejoignez la communauté qui connecte le savoir académique aux compétences réelles de la vie active.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/tools"
              className="bg-edu-accent text-edu-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-lg shadow-edu-accent/25 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Wrench size={20} />
              Accéder aux Outils
            </Link>
            <button
              onClick={openAskQuestionModal}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Poser une question
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-blue-200/80">
            <div className="flex -space-x-3">
              {MOCK_MENTORS.map(m => (
                <img key={m.id} src={m.user.avatar} alt="user" className="w-8 h-8 rounded-full border-2 border-edu-primary" />
              ))}
              <div className="w-8 h-8 rounded-full bg-edu-secondary border-2 border-edu-primary flex items-center justify-center text-xs font-bold text-white">+2k</div>
            </div>
            <p>Étudiants du Bénin, Sénégal, Côte d'Ivoire...</p>
          </div>
        </div>
      </section>

      {/* --- STATS FLOATING BAR --- */}
      <div className="relative -mt-24 mx-4 md:mx-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {loadingImpactStats ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))
          ) : (
            impactStats.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center text-center space-y-2 group">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {getIcon(stat.icon)}
                </div>
                <div className="text-3xl font-bold text-edu-primary dark:text-white">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.title}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- VALUE PROPOSITION --- */}
      <section className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-edu-primary dark:text-white mb-4">La Vision Hypee</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Nous avons créé EduLab pour répondre à une réalité africaine : trop de théorie, pas assez de pratique.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">Du Concret, Enfin</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Accédez à des laboratoires virtuels, des environnements de code et des outils scientifiques introuvables dans la plupart des écoles.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-500 mb-6">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">Savoir-Faire Actif</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ne vous contentez plus d'apprendre par cœur. Manipulez, testez et comprenez comment appliquer vos cours dans la vie réelle.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
              <Brain size={32} />
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">L'IA comme Tuteur</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Notre intelligence artificielle comble les lacunes des manuels scolaires en expliquant le "pourquoi" et le "comment" de chaque concept.
            </p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-edu-primary dark:text-white mb-4">L'approche technologique</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Comment nous transformons votre apprentissage en trois étapes.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12 max-w-5xl mx-auto px-4">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-edu-accent/50 to-gray-200 dark:from-gray-700 dark:via-edu-accent/50 dark:to-gray-700 -z-10"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 border-2 border-edu-secondary/20 rounded-full flex items-center justify-center text-edu-secondary shadow-lg group-hover:scale-110 group-hover:border-edu-accent transition-all duration-300 mb-6 relative z-10">
              <GraduationCap size={32} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-edu-accent text-edu-primary font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">1</div>
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">La Théorie (École)</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Vous suivez vos cours classiques à l'université ou au lycée pour acquérir les bases.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 border-2 border-edu-secondary/20 rounded-full flex items-center justify-center text-edu-secondary shadow-lg group-hover:scale-110 group-hover:border-edu-accent transition-all duration-300 mb-6 relative z-10">
              <Wrench size={32} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-edu-accent text-edu-primary font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">2</div>
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">La Pratique (Outils)</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Vous utilisez nos simulateurs scientifiques et bacs à sable pour appliquer ces concepts concrètement.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 border-2 border-edu-secondary/20 rounded-full flex items-center justify-center text-edu-secondary shadow-lg group-hover:scale-110 group-hover:border-edu-accent transition-all duration-300 mb-6 relative z-10">
              <Users size={32} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-edu-accent text-edu-primary font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">3</div>
            </div>
            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-3">L'Intégration (Communauté)</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Vous échangez avec des mentors et d'autres apprenants pour consolider vos acquis.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTENT PREVIEW --- */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 -mx-4 px-4 md:px-12 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Recent Questions Column */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-edu-primary dark:text-white mb-2">Entraide en direct</h2>
                  <p className="text-gray-500 text-sm">Des réponses concrètes à vos blocages théoriques.</p>
                </div>
                <Link to="/questions" className="text-edu-secondary font-semibold hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {loadingQuestions ? (
                  // Skeleton for questions
                  Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-40 animate-pulse"></div>
                  ))
                ) : (
                  questions.map(q => (
                    <QuestionCard key={q.id} question={q} />
                  ))
                )}
              </div>
            </div>

            {/* Opportunities & Featured Mentor Column */}
            <div className="space-y-8">

              {/* Featured Opportunity */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold text-edu-primary dark:text-white">Opportunités réelles</h2>
                  <Link to="/opportunities" className="text-edu-secondary font-semibold hover:underline flex items-center gap-1">
                    Explorer <ArrowRight size={16} />
                  </Link>
                </div>
                {featuredOpportunity ? (
                  <div className="group relative bg-edu-primary rounded-2xl overflow-hidden shadow-lg h-64 flex items-end p-6 text-white">
                    {featuredOpportunity.image ? (
                      <img src={featuredOpportunity.image} alt="opp" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-edu-secondary to-edu-primary opacity-40 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                        <GraduationCap size={120} className="text-white/10" />
                      </div>
                    )}
                    <div className="relative z-10 w-full">
                      <div className="bg-edu-accent text-edu-primary text-xs font-bold px-2 py-1 rounded w-fit mb-2">{featuredOpportunity.type}</div>
                      <h3 className="text-xl font-bold leading-tight mb-1">{featuredOpportunity.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{featuredOpportunity.provider}</p>
                      <a
                        href={featuredOpportunity.external_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-white/10 backdrop-blur hover:bg-white hover:text-edu-primary border border-white/30 text-white py-2 rounded-lg transition-all font-medium text-sm"
                      >
                        Voir les détails
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-64 flex items-center justify-center text-gray-500">
                    Chargement des opportunités...
                  </div>
                )}
              </div>

              {/* Quick Tip Box */}
              <div className="bg-gradient-to-r from-edu-accent/10 to-orange-50 dark:to-gray-800 border border-edu-accent/20 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-edu-accent/20 p-2 rounded-lg shrink-0">
                  <Sparkles className="text-edu-accent" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-edu-primary dark:text-white mb-1">Le mot de Hypee</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "Le diplôme est important, mais la compétence est essentielle. Utilisez nos outils pour maîtriser ce que vous apprenez."
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-edu-primary dark:text-white mb-12">L'impact EduLab</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {loadingTestimonials ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 animate-pulse"></div>
            ))
          ) : testimonials.length > 0 ? (
            testimonials.map((t) => (
              <div key={t.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-edu-secondary text-white p-2 rounded-full border-4 border-white dark:border-gray-800">
                  <MessageCircle size={16} />
                </div>
                <div className="mt-4 flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} className="fill-edu-accent text-edu-accent" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{t.text}"</p>
                <div>
                  <div className="font-bold text-edu-primary dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} • {t.country}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-gray-500">Aucun témoignage pour le moment.</div>
          )}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="relative bg-edu-primary rounded-3xl p-8 md:p-16 text-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à maîtriser vos outils ?</h2>
          <p className="text-blue-200 max-w-2xl mx-auto mb-8 text-lg">
            Rejoignez gratuitement la communauté qui comble le vide éducatif en Afrique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link to="/register" className="bg-edu-accent text-edu-primary px-8 py-3 rounded-full font-bold hover:bg-white transition-colors text-lg">
                Créer mon compte gratuit
              </Link>
            )}
            <Link to="/about" className="bg-transparent border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-edu-primary transition-colors text-lg">
              Découvrir Hypee
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-edu-secondary/50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </section>

    </div>
  );
};

export default Home;