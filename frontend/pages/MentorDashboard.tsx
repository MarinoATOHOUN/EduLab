import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare as ChatIcon,
    MoreHorizontal,
    Star,
    Award,
    FileText,
    HelpCircle,
    MapPin,
    GraduationCap,
    X,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Mentor } from '../types';
import EditProfileModal from '../components/EditProfileModal';
import ManageAvailabilityModal from '../components/ManageAvailabilityModal';
import { mentorService, bookingsService } from '../services';
import type { Booking } from '../services';

const MentorDashboard: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'sessions' | 'students'>('overview');
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isManageAvailabilityOpen, setIsManageAvailabilityOpen] = useState(false);

    // Student Profile Modal State
    const [selectedStudent, setSelectedStudent] = useState<Booking['student'] | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    // Real data states
    const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        studentsHelped: 0,
        averageRating: 0,
        monthlyHours: 0
    });

    // Fetch mentor data and bookings - MUST be before any conditional returns
    useEffect(() => {
        const fetchData = async () => {
            if (!user || user.role !== UserRole.MENTOR) return;

            try {
                setLoading(true);

                // Fetch mentor profile
                const profile = await mentorService.getMyMentorProfile();
                setMentorProfile(profile);

                // Fetch all bookings
                const allBookings = await bookingsService.getMentorRequests();
                setBookings(allBookings);

                // Filter pending requests
                const pending = allBookings.filter((b: Booking) => b.status === 'PENDING');
                setPendingRequests(pending);

                // Calculate stats
                const completed = allBookings.filter((b: Booking) => b.status === 'COMPLETED');
                const uniqueStudents = new Set(allBookings.map((b: Booking) => b.student.id));

                setStats({
                    totalSessions: completed.length,
                    studentsHelped: uniqueStudents.size,
                    averageRating: profile.rating || 0,
                    monthlyHours: completed.length * 1 // Assuming 1h per session
                });

            } catch (error) {
                console.error('Failed to fetch mentor data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleAcceptRequest = async (id: string) => {
        try {
            await bookingsService.updateBookingStatus(id, 'CONFIRMED');
            alert('Demande acceptée ! L\'étudiant sera notifié.');

            // Refresh bookings
            const allBookings = await bookingsService.getMentorRequests();
            setBookings(allBookings);
            setPendingRequests(allBookings.filter((b: Booking) => b.status === 'PENDING'));
        } catch (error) {
            console.error('Failed to accept request:', error);
            alert('Erreur lors de l\'acceptation de la demande.');
        }
    };

    const handleRejectRequest = async (id: string) => {
        try {
            await bookingsService.updateBookingStatus(id, 'REJECTED', 'Indisponible pour ce créneau');
            alert('Demande refusée.');

            // Refresh bookings
            const allBookings = await bookingsService.getMentorRequests();
            setBookings(allBookings);
            setPendingRequests(allBookings.filter((b: Booking) => b.status === 'PENDING'));
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Erreur lors du refus de la demande.');
        }
    };

    const openStudentProfile = (student: Booking['student']) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    // Format date helper
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Aujourd\'hui';
        if (date.toDateString() === tomorrow.toDateString()) return 'Demain';

        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).format(date);
    };

    const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5); // HH:MM
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `Il y a ${diffMins}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return 'Hier';
        return `Il y a ${diffDays}j`;
    };

    const STATS = [
        { label: 'Sessions totales', value: stats.totalSessions.toString(), icon: <ChatIcon size={24} />, color: 'bg-blue-500' },
        { label: 'Étudiants aidés', value: stats.studentsHelped.toString(), icon: <Users size={24} />, color: 'bg-green-500' },
        { label: 'Note moyenne', value: stats.averageRating.toFixed(1), icon: <Star size={24} />, color: 'bg-yellow-500' },
        { label: 'Heures ce mois', value: `${stats.monthlyHours}h`, icon: <Clock size={24} />, color: 'bg-purple-500' },
    ];

    const upcomingBookings = bookings
        .filter(b => {
            if (b.status !== 'CONFIRMED') return false;

            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [year, month, day] = b.date.split('-').map(Number);
            const bookingDate = new Date(year, month - 1, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return bookingDate >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    // Redirect if not logged in or not a mentor - AFTER all hooks
    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Accès restreint</h2>
                <Link to="/login" className="bg-edu-secondary text-white px-6 py-2 rounded-full">Se connecter</Link>
            </div>
        );
    }

    if (user.role !== UserRole.MENTOR) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4 text-red-600 dark:text-red-400">
                    <XCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Espace réservé aux Mentors</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Vous êtes connecté en tant qu'étudiant. Pour devenir mentor, vous devez soumettre une candidature.
                </p>
                <div className="flex gap-4">
                    <Link to="/" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-full">
                        Retour à l'accueil
                    </Link>
                    <Link to="/mentors" className="bg-edu-secondary text-white px-6 py-2 rounded-full">
                        Devenir Mentor
                    </Link>
                </div>
            </div>
        );
    }

    const renderRequestCard = (req: Booking) => (
        <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            {/* Header: Student Info & Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => openStudentProfile(req.student)} className="relative group">
                        <img
                            src={req.student.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.student.profile?.name || req.student.email)}`}
                            alt={req.student.profile?.name || req.student.email}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 group-hover:border-edu-secondary transition-colors"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Voir
                        </div>
                    </button>
                    <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white hover:text-edu-secondary cursor-pointer" onClick={() => openStudentProfile(req.student)}>
                            {req.student.profile?.name || req.student.email}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>{getRelativeTime(req.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-edu-primary dark:text-white text-lg">{formatDate(req.date)}</div>
                    <div className="text-edu-secondary font-medium">{formatTime(req.time)}</div>
                </div>
            </div>

            {/* Body: Details */}
            <div className="space-y-4 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <HelpCircle size={12} /> Sujet du rendez-vous
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {req.main_question || "Non spécifié"}
                    </p>
                </div>
                <div>
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText size={12} /> Attentes de l'apprenant
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                        "{req.expectation || "Non spécifié"}"
                    </p>
                </div>
                <div>
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Domaines</h5>
                    <div className="flex flex-wrap gap-2">
                        {req.domains.map(d => (
                            <span key={d} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium">
                                {d}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: Actions */}
            <div className="flex gap-3">
                <button
                    onClick={() => openStudentProfile(req.student)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    <Users size={18} />
                    Profil
                </button>
                <div className="flex-grow"></div>
                <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="px-5 py-2.5 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                    Refuser
                </button>
                <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="px-6 py-2.5 bg-edu-secondary text-white rounded-xl font-bold hover:bg-edu-primary transition-colors shadow-md flex items-center gap-2"
                >
                    <CheckCircle size={18} />
                    Accepter
                </button>
            </div>
        </div>
    );

    const renderConfirmedCard = (booking: Booking) => (
        <div key={booking.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-l-4 border-l-green-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => openStudentProfile(booking.student)} className="relative group">
                        <img
                            src={booking.student.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.student.profile?.name || booking.student.email)}`}
                            alt={booking.student.profile?.name || booking.student.email}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-100 dark:border-green-900/30 group-hover:border-green-500 transition-colors"
                        />
                    </button>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                            {booking.student.profile?.name || booking.student.email}
                        </h4>
                        <div className="flex items-center gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                <CheckCircle size={12} /> Confirmé
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400">{booking.domains[0] || "Session"}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{formatDate(booking.date)}</div>
                    <div className="text-edu-secondary text-sm font-medium">{formatTime(booking.time)}</div>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <Link
                    to={`/chat?partner=${booking.student.id}`}
                    className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-edu-primary text-white rounded-xl text-sm font-bold hover:bg-edu-secondary transition-colors shadow-sm"
                >
                    <MessageSquare size={16} />
                    Ouvrir le chat
                </Link>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg shadow-gray-200 dark:shadow-none`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Pending Requests Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Demandes en attente</h3>
                                {pendingRequests.length > 0 && (
                                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setActiveTab('requests')} className="text-sm text-edu-secondary hover:underline font-medium">Voir tout</button>
                        </div>

                        <div className="space-y-4">
                            {pendingRequests.slice(0, 2).map(req => renderRequestCard(req))}
                            {pendingRequests.length === 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune nouvelle demande.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Confirmed Sessions Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Séances confirmées</h3>
                                {upcomingBookings.length > 0 && (
                                    <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                        {upcomingBookings.length}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setActiveTab('sessions')} className="text-sm text-edu-secondary hover:underline font-medium">Calendrier</button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {upcomingBookings.slice(0, 4).map(booking => renderConfirmedCard(booking))}
                            {upcomingBookings.length === 0 && (
                                <div className="sm:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune séance confirmée à venir.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Session Card */}
                <div>
                    <div className="bg-gradient-to-br from-edu-primary to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden sticky top-24">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-6 relative z-10">Prochaine Séance</h3>

                        {upcomingBookings.length > 0 ? (
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={upcomingBookings[0].student.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(upcomingBookings[0].student.profile?.name || upcomingBookings[0].student.email)}`}
                                        alt="student"
                                        className="w-16 h-16 rounded-full border-2 border-white/30"
                                    />
                                    <div>
                                        <div className="text-xl font-bold">{upcomingBookings[0].student.profile?.name || upcomingBookings[0].student.email}</div>
                                        <div className="text-blue-200 text-sm">{upcomingBookings[0].domains.join(', ')}</div>
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-edu-accent" />
                                        <span className="font-medium">{formatDate(upcomingBookings[0].date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-edu-accent" />
                                        <span className="font-medium">{formatTime(upcomingBookings[0].time)}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/chat?partner=${upcomingBookings[0].student.id}`}
                                    className="w-full mt-6 bg-edu-accent text-edu-primary py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={20} />
                                    Ouvrir la messagerie
                                </Link>
                            </div>
                        ) : (
                            <p className="text-blue-200 relative z-10">Aucune séance prévue aujourd'hui.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header Banner */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={user.avatar} alt="Mentor" className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-md" />
                                <div className="absolute -bottom-1 -right-1 bg-edu-accent text-edu-primary p-1.5 rounded-full border-2 border-white dark:border-gray-700">
                                    <Award size={16} />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bonjour, {user.name} !</h1>
                                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Mentorat Actif • {user.university}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditProfileModalOpen(true)}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Modifier Profil
                            </button>
                            <button
                                onClick={() => setIsManageAvailabilityOpen(true)}
                                className="px-4 py-2 bg-edu-primary text-white rounded-lg font-bold hover:bg-edu-secondary transition-colors shadow-md flex items-center gap-2"
                            >
                                <Calendar size={18} />
                                Gérer mes disponibilités
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-8 overflow-x-auto pb-1">
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={18} /> },
                            { id: 'requests', label: 'Demandes', icon: <MessageSquare size={18} />, count: pendingRequests.length },
                            { id: 'sessions', label: 'Séances', icon: <Calendar size={18} /> },
                            { id: 'students', label: 'Mes Étudiants', icon: <Users size={18} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-edu-secondary text-edu-secondary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.count && tab.count > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'overview' && renderOverview()}

                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Toutes les demandes</h2>
                        </div>
                        <div className="grid gap-6">
                            {pendingRequests.length > 0 ? pendingRequests.map(req => renderRequestCard(req)) : (
                                <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    Aucune demande en attente.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="space-y-6 animate-in fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Séances programmées</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase font-bold border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="p-6">Étudiant</th>
                                        <th className="p-6">Sujet</th>
                                        <th className="p-6">Date & Heure</th>
                                        <th className="p-6">Statut</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {upcomingBookings.map(session => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={session.student.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.student.profile?.name || session.student.email)}`}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full cursor-pointer"
                                                        onClick={() => openStudentProfile(session.student)}
                                                    />
                                                    <span
                                                        className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-edu-secondary"
                                                        onClick={() => openStudentProfile(session.student)}
                                                    >
                                                        {session.student.profile?.name || session.student.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-gray-600 dark:text-gray-300">{session.domains.join(', ')}</td>
                                            <td className="p-6">
                                                <div className="font-medium text-gray-900 dark:text-white">{formatDate(session.date)}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{formatTime(session.time)}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${session.status === 'CONFIRMED'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {session.status_label}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="p-2 text-gray-400 hover:text-edu-secondary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {upcomingBookings.length === 0 && (
                                <div className="p-12 text-center text-gray-500">Aucune séance programmée.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Annuaire des étudiants</h3>
                        <p className="text-gray-500 dark:text-gray-400">Retrouvez ici l'historique de tous les étudiants que vous avez accompagnés.</p>
                    </div>
                )}
            </div>

            {/* Student Profile Modal */}
            {isStudentModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="relative h-32 bg-gradient-to-r from-edu-primary to-edu-secondary">
                            <button
                                onClick={() => setIsStudentModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6 flex justify-center">
                                <img
                                    src={selectedStudent.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.profile?.name || selectedStudent.email)}`}
                                    alt={selectedStudent.profile?.name}
                                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-white"
                                />
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {selectedStudent.profile?.name || "Étudiant"}
                                </h3>
                                <p className="text-edu-secondary font-medium">{selectedStudent.profile?.university || "Université non renseignée"}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Pays</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{selectedStudent.profile?.country || "Non renseigné"}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Université</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{selectedStudent.profile?.university || "Non renseigné"}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Email</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{selectedStudent.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => setIsStudentModalOpen(false)}
                                    className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Modals */}
            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
            />
            <ManageAvailabilityModal
                isOpen={isManageAvailabilityOpen}
                onClose={() => setIsManageAvailabilityOpen(false)}
                onSave={() => {
                    // Refresh data after saving
                    if (user && user.role === UserRole.MENTOR) {
                        mentorService.getMyMentorProfile().then(setMentorProfile);
                    }
                }}
            />
        </div>
    );
};

export default MentorDashboard;