import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar as CalendarIcon, ShieldCheck, MessageCircle, ChevronLeft, X, Send, CheckCircle2, Award, Clock, Linkedin, Twitter, Globe, Heart, ThumbsUp, HelpCircle, FileText, Target } from 'lucide-react';
import { BADGES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { mentorService, bookingsService } from '../services';
import { Mentor } from '../types';

const MentorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // États pour les données du mentor
  const [displayMentor, setDisplayMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Message Modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // States for Booking
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // States for Booking Form Details (Mandatory)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDomains, setBookingDomains] = useState<string[]>([]); // Array for multiple selection
  const [bookingExpectations, setBookingExpectations] = useState('');
  const [bookingQuestion, setBookingQuestion] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // States for Rating
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  // Charger les données du mentor depuis l'API
  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await mentorService.getMentor(id);
        setDisplayMentor(data);

        // Vérifier si l'utilisateur consulte son propre profil
        if (user && data.user.id === user.id) {
          // Rediriger vers le dashboard du mentor
          navigate('/mentor-dashboard');
          return;
        }

        // Charger les disponibilités
        fetchAvailability(id);
      } catch (err) {
        console.error('Failed to load mentor:', err);
        setError('Mentor introuvable');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [id, user, navigate]);

  const fetchAvailability = async (mentorId: string) => {
    try {
      setLoadingSlots(true);
      // Calculer les dates pour les 14 prochains jours
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 14);

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const slots = await mentorService.getAvailableSlots(mentorId, startStr, endStr);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Failed to load slots", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // État d'erreur ou mentor non trouvé
  if (error || !displayMentor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">{error || 'Mentor introuvable'}</h2>
        <Link to="/mentors" className="text-edu-secondary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  // Retrieve Mentor Badges
  const mentorBadges = BADGES.filter(b => displayMentor.user.badges.includes(b.id));

  // Generate upcoming 14 days
  const upcomingDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Get slots for selected date
  const getSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots[dateStr] || [];
  };

  const timeSlots = getSlotsForDate(selectedDate);

  const initiateBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedDate && selectedTime) {
      setIsBookingModalOpen(true);
    }
  };

  const toggleDomain = (domain: string) => {
    setBookingDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation manual check for domains array
    if (bookingDomains.length === 0 || !bookingExpectations.trim() || !bookingQuestion.trim()) {
      alert("Veuillez remplir tous les champs obligatoires, y compris au moins un domaine.");
      return;
    }

    if (!selectedDate || !selectedTime || !displayMentor) return;

    try {
      setIsBookingSubmitting(true);

      const dateStr = selectedDate.toISOString().split('T')[0];

      await bookingsService.createBooking({
        mentor_id: displayMentor.user.id, // Use User ID, not MentorProfile ID
        date: dateStr,
        time: selectedTime,
        domains: bookingDomains,
        expectations: bookingExpectations,
        main_questions: bookingQuestion
      });

      setBookingSuccess(true);
      setIsBookingModalOpen(false);

      // Rafraîchir les disponibilités pour retirer le créneau pris
      if (id) fetchAvailability(id);

      // Reset form after success message duration
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setBookingDomains([]);
        setBookingExpectations('');
        setBookingQuestion('');
      }, 4000);

    } catch (error: any) {
      console.error("Booking failed", error);
      let errorMessage = "Échec de la réservation. Veuillez réessayer.";

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.error) {
          errorMessage = data.error;
        } else {
          // Collecter les erreurs de validation des champs
          const fieldErrors = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${(msgs as any[]).join(', ')}`)
            .join('\n');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      }

      alert(errorMessage);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const handleOpenRating = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (selectedStar === 0) return;

    try {
      // Appel API pour noter le mentor
      await mentorService.rateMentor(displayMentor.id, selectedStar);

      // Recharger les données du mentor pour avoir la nouvelle moyenne
      if (id) {
        const updatedMentor = await mentorService.getMentor(id);
        setDisplayMentor(updatedMentor);
      }

      setHasRated(true);

      setTimeout(() => {
        setIsRatingModalOpen(false);
        setHoveredStar(0);
        setSelectedStar(0);
        // On laisse hasRated à true pour l'instant ou on le reset si on veut permettre de re-noter (mais le backend bloque)
        setHasRated(false);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to rate mentor:', err);
      alert(err.response?.data?.error || 'Impossible d\'envoyer votre avis. Vous avez peut-être déjà noté ce mentor.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      <Link to="/mentors" className="inline-flex items-center text-gray-500 hover:text-edu-secondary mb-6 transition-colors">
        <ChevronLeft size={20} />
        <span>Retour aux mentors</span>
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={displayMentor.user.avatar}
                  alt={displayMentor.user.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-md object-cover"
                />
                {displayMentor.user.isOnline && (
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800" title="En ligne"></div>
                )}
              </div>

              <h1 className="mt-4 text-xl font-bold text-edu-primary dark:text-white">{displayMentor.user.name}</h1>
              <p className="text-sm text-edu-secondary font-medium mb-2">{displayMentor.user.university}</p>

              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                <MapPin size={16} className="mr-1" />
                {displayMentor.user.country}
              </div>

              <div className="grid grid-cols-2 w-full gap-4 mb-6 border-t border-b border-gray-100 dark:border-gray-700 py-4">
                <div>
                  <div className="flex items-center justify-center text-yellow-500 font-bold text-lg">
                    <Star size={18} className="fill-current mr-1" />
                    {displayMentor.rating}
                  </div>
                  <div className="text-xs text-gray-400">Note</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-edu-primary dark:text-white">{displayMentor.reviews}</div>
                  <div className="text-xs text-gray-400">Avis</div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mb-6 flex items-center justify-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold">
                <Heart size={16} className="fill-current" />
                Mentorat Bénévole
              </div>

              <div className="space-y-3 w-full">
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="w-full bg-white dark:bg-gray-700 border border-edu-primary dark:border-gray-500 text-edu-primary dark:text-white hover:bg-edu-primary hover:text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Envoyer un message
                </button>

                <button
                  onClick={handleOpenRating}
                  disabled={hasRated}
                  className={`w-full py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${hasRated
                    ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600'
                    }`}
                >
                  {hasRated ? (
                    <>
                      <CheckCircle2 size={18} />
                      Avis envoyé
                    </>
                  ) : (
                    <>
                      <Star size={18} />
                      Noter ce mentor
                    </>
                  )}
                </button>
              </div>

              {/* Social Links */}
              {displayMentor.socials && (
                <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 w-full">
                  {displayMentor.socials.linkedin && (
                    <a href={displayMentor.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors" title="LinkedIn">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {displayMentor.socials.twitter && (
                    <a href={displayMentor.socials.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors" title="Twitter/X">
                      <Twitter size={20} />
                    </a>
                  )}
                  {displayMentor.socials.website && (
                    <a href={displayMentor.socials.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-edu-secondary transition-colors" title="Site Web">
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Content & Booking */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-4">À propos</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {displayMentor.bio}
            </p>

            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Spécialités</h3>
            <div className="flex flex-wrap gap-2">
              {displayMentor.specialties.map(s => (
                <button key={s} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          {mentorBadges.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-4 flex items-center gap-2">
                <Award className="text-edu-accent" />
                Badges & Récompenses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mentorBadges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className={`text-2xl p-2 rounded-full ${badge.color} bg-opacity-20`}>
                      {badge.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-edu-primary dark:text-white">{badge.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability & Booking Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="text-edu-accent" />
              Disponibilités
            </h2>

            {/* Date Selection (Horizontal Scroll) */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Choisissez une date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {upcomingDays.map((date, i) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-20 p-3 rounded-xl border text-center transition-all ${isSelected
                        ? 'border-edu-secondary bg-edu-secondary text-white shadow-md transform scale-105'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-edu-secondary hover:bg-blue-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div className="text-xs uppercase font-bold mb-1">{new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date)}</div>
                      <div className="text-lg font-bold">{date.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Choisissez un horaire</h3>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-edu-secondary"></div>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${selectedTime === time
                          ? 'border-edu-secondary bg-edu-secondary/10 text-edu-secondary'
                          : 'border-gray-200 dark:border-gray-600 hover:border-edu-secondary text-gray-600 dark:text-gray-300'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucun créneau disponible pour cette date.</p>
                )}
              </div>
            )}

            {/* Booking Action */}
            <button
              disabled={!selectedDate || !selectedTime || bookingSuccess}
              onClick={initiateBooking}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${bookingSuccess
                ? 'bg-green-500 text-white'
                : (!selectedDate || !selectedTime)
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-edu-accent text-edu-primary hover:bg-yellow-300 shadow-lg hover:shadow-xl'
                }`}
            >
              {bookingSuccess ? (
                <>
                  <CheckCircle2 size={24} />
                  Réservation confirmée !
                </>
              ) : (
                <>
                  <Clock size={20} />
                  Réserver le créneau
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-edu-primary dark:text-white">Message à {displayMentor.user.name}</h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Bonjour, je souhaiterais échanger avec vous concernant..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl h-32 resize-none mb-4 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-edu-secondary dark:text-white"
            ></textarea>
            <button
              onClick={async () => {
                if (!messageText.trim()) {
                  alert('Veuillez écrire un message');
                  return;
                }

                try {
                  setSendingMessage(true);

                  // Importer le service
                  const { messagingService } = await import('../services/messaging');

                  // Créer la conversation avec le message initial
                  // displayMentor.user.id est maintenant un ID réel depuis l'API
                  const conversation = await messagingService.createConversation(
                    [displayMentor.user.id],
                    messageText
                  );

                  // Rediriger vers le chat
                  navigate('/chat');

                  // Fermer le modal
                  setIsMessageModalOpen(false);
                  setMessageText('');
                } catch (error) {
                  console.error('Failed to create conversation', error);
                  alert('Erreur lors de la création de la conversation. Veuillez réessayer.');
                } finally {
                  setSendingMessage(false);
                }
              }}
              disabled={!messageText.trim() || sendingMessage}
              className="w-full bg-edu-secondary text-white py-3 rounded-xl font-bold hover:bg-edu-primary transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal (MANDATORY) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-0 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-edu-primary text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl mb-1">Détails du Rendez-vous</h3>
                  <p className="text-blue-200 text-sm flex items-center gap-2">
                    <CalendarIcon size={14} />
                    {selectedDate?.toLocaleDateString()} à {selectedTime}
                  </p>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={confirmBooking} className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200 flex gap-3">
                <HelpCircle className="shrink-0 mt-0.5" size={18} />
                <p>Pour préparer au mieux l'entretien, veuillez fournir les informations ci-dessous. Toutes les questions sont obligatoires.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-edu-secondary" />
                  Domaines de l'entrevue (Plusieurs choix possibles) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayMentor.specialties.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleDomain(spec)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${bookingDomains.includes(spec)
                        ? 'bg-edu-secondary text-white border-edu-secondary'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                      {spec}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => toggleDomain('Autre')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${bookingDomains.includes('Autre')
                      ? 'bg-edu-secondary text-white border-edu-secondary'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    Autre
                  </button>
                </div>
                {bookingDomains.length === 0 && <p className="text-xs text-red-500 mt-2">Veuillez sélectionner au moins un domaine.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-edu-secondary" />
                  Vos attentes pour ce rendez-vous <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={bookingExpectations}
                  onChange={(e) => setBookingExpectations(e.target.value)}
                  className="w-full p-3 h-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-edu-secondary resize-none"
                  placeholder="Décrivez brièvement ce que vous espérez obtenir de cet échange..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <HelpCircle size={16} className="text-edu-secondary" />
                  Sujet / Questionnement principal <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={bookingQuestion}
                  onChange={(e) => setBookingQuestion(e.target.value)}
                  className="w-full p-3 h-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-edu-secondary resize-none"
                  placeholder="Quelle est la difficulté majeure sur laquelle le mentor doit vous aider ?"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-edu-accent text-edu-primary font-bold text-lg rounded-xl shadow-lg hover:bg-yellow-400 transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Confirmer le rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
            {hasRated ? (
              <div className="py-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp size={32} />
                </div>
                <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-2">Merci !</h3>
                <p className="text-gray-500 dark:text-gray-400">Votre avis a bien été pris en compte.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-2">Notez votre expérience</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comment s'est passé votre mentorat avec {displayMentor.user.name.split(' ')[0]} ?</p>

                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setSelectedStar(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${star <= (hoveredStar || selectedStar)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRatingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitRating}
                    disabled={selectedStar === 0}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-edu-accent text-edu-primary hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;