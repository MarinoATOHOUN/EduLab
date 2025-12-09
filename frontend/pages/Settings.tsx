import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingsService } from '../services';
import { Booking } from '../services/bookings';
import { UserRole } from '../types';
import {
    Settings as SettingsIcon,
    Calendar,
    Shield,
    Bell,
    User,
    Clock,
    MessageSquare,
    XCircle,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'appointments' | 'security'>('appointments');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Helper function to get the partner (the other person in the booking)
    const getPartner = (booking: Booking) => {
        // If the current user is the student, the partner is the mentor
        // If the current user is the mentor, the partner is the student
        if (user?.id === booking.student.id) {
            return booking.mentor;
        } else {
            return booking.student;
        }
    };

    // Get the appropriate label based on user role
    const getPartnerLabel = (booking: Booking) => {
        if (user?.id === booking.student.id) {
            return 'Mentor';
        } else {
            return 'Étudiant';
        }
    };

    useEffect(() => {
        if (activeTab === 'appointments') {
            fetchBookings();
        }
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingsService.getBookings();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

        setCancellingId(id);
        try {
            await bookingsService.cancelBooking(id);
            // Refresh list
            await fetchBookings();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Impossible d\'annuler le rendez-vous.');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'CANCELLED': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            case 'COMPLETED': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'Confirmé';
            case 'PENDING': return 'En attente';
            case 'CANCELLED': return 'Annulé';
            case 'COMPLETED': return 'Terminé';
            case 'REJECTED': return 'Refusé';
            default: return status;
        }
    };

    const renderAppointments = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes Rendez-vous</h2>
                <button
                    onClick={fetchBookings}
                    className="text-sm text-edu-primary hover:underline"
                >
                    Actualiser
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-edu-primary" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucun rendez-vous prévu.</p>
                    <a href="#/mentors" className="text-edu-primary font-medium hover:underline mt-2 inline-block">
                        Trouver un mentor
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                            {/* Date & Time Box */}
                            <div className="flex flex-col items-center justify-center p-4 bg-edu-bg dark:bg-gray-700/50 rounded-lg min-w-[100px]">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {new Date(booking.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                </span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {new Date(booking.date).getDate()}
                                </span>
                                <span className="text-sm font-medium text-edu-primary mt-1">
                                    {booking.time.substring(0, 5)}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                            Session avec {getPartner(booking).name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                            {booking.domains?.join(', ') || 'Mentorat général'}
                                        </p>
                                    </div>
                                    <img
                                        src={getPartner(booking).avatar}
                                        alt={getPartner(booking).name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        <span>Messagerie interne</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>1 heure</span>
                                    </div>
                                </div>

                                {booking.expectation && (
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium block mb-1">Attentes :</span>
                                        {booking.expectation}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col justify-center gap-2 md:border-l md:pl-6 border-gray-100 dark:border-gray-700">
                                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        disabled={cancellingId === booking.id}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {cancellingId === booking.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <XCircle size={16} />
                                        )}
                                        Annuler
                                    </button>
                                )}
                                {booking.status === 'COMPLETED' && (
                                    <button className="flex items-center gap-2 px-4 py-2 text-edu-primary hover:bg-edu-bg dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium">
                                        <CheckCircle size={16} />
                                        Laisser un avis
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderGeneral = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paramètres Généraux</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-edu-bg dark:bg-gray-700 text-edu-primary rounded-full text-xs font-medium uppercase tracking-wider">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Université / École</h4>
                            <p className="text-sm text-gray-500">{user?.university || 'Non renseigné'}</p>
                        </div>
                        <button className="text-edu-primary hover:underline text-sm font-medium">Modifier</button>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Pays</h4>
                            <p className="text-sm text-gray-500">{user?.country || 'Non renseigné'}</p>
                        </div>
                        <button className="text-edu-primary hover:underline text-sm font-medium">Modifier</button>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Langue</h4>
                            <p className="text-sm text-gray-500">Français (France)</p>
                        </div>
                        <button className="text-edu-primary hover:underline text-sm font-medium">Modifier</button>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Fuseau horaire</h4>
                            <p className="text-sm text-gray-500">Europe/Paris (GMT+1)</p>
                        </div>
                        <button className="text-edu-primary hover:underline text-sm font-medium">Modifier</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sécurité</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex gap-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg h-fit">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Mot de passe</h4>
                                <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Changer
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg h-fit">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</h4>
                                <p className="text-sm text-gray-500">Recommandé pour plus de sécurité</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-edu-primary text-white rounded-lg text-sm font-medium hover:bg-edu-secondary transition-colors">
                            Activer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Paramètres</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'general'
                                ? 'bg-edu-primary text-white shadow-lg shadow-edu-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <SettingsIcon size={20} />
                            Général
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'appointments'
                                ? 'bg-edu-primary text-white shadow-lg shadow-edu-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Calendar size={20} />
                            Rendez-vous
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'security'
                                ? 'bg-edu-primary text-white shadow-lg shadow-edu-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Shield size={20} />
                            Sécurité
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'general' && renderGeneral()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'security' && renderSecurity()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
