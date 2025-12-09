import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar as CalendarIcon, AlertCircle, Save, CalendarDays, Repeat } from 'lucide-react';
import { mentorService, bookingsService } from '../services';

interface AvailabilitySlot {
    id?: string;
    tempId?: string; // Pour usage interne frontend (clés React stables)
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active?: boolean;
}

interface SpecificDateSlot {
    id?: string;
    date: string;
    start_time: string;
    end_time: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

const DAYS = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' },
    { value: 'SUNDAY', label: 'Dimanche' },
];

const ManageAvailabilityModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<'recurring' | 'specific'>('recurring');
    const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
    const [specificDates, setSpecificDates] = useState<SpecificDateSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            fetchAvailabilities();
            fetchBookedSlots();
        }
    }, [isOpen]);

    const fetchAvailabilities = async () => {
        try {
            setLoading(true);
            const data = await mentorService.getMyMentorProfile();

            // Parse availability string or use structured data if available
            // Note: mentorService now handles parsing, so data.availability should be populated correctly if mapped
            // But we need to handle the specific format returned by our new serializer

            // Si on a déjà des données structurées (via le fix du service), on les utilise
            // Sinon on parse le string comme avant

            let slots: AvailabilitySlot[] = [];

            if (data.availability) {
                const parts = data.availability.split(' • ');
                const dayMap: Record<string, string> = {
                    'Lundi': 'MONDAY', 'Mardi': 'TUESDAY', 'Mercredi': 'WEDNESDAY',
                    'Jeudi': 'THURSDAY', 'Vendredi': 'FRIDAY', 'Samedi': 'SATURDAY', 'Dimanche': 'SUNDAY'
                };

                slots = parts.map((part, idx) => {
                    // Format: "Lundi : 09:00 - 10:00"
                    const [dayLabel, timeRange] = part.split(' : ');
                    if (dayLabel && timeRange && dayMap[dayLabel]) {
                        const times = timeRange.split(' - ');
                        return {
                            id: `existing-${idx}`,
                            tempId: `slot-${Date.now()}-${idx}`, // Unique ID
                            day_of_week: dayMap[dayLabel] || 'MONDAY',
                            start_time: times[0]?.trim() || '09:00',
                            end_time: times[1]?.trim() || '10:00',
                            is_active: true
                        };
                    }
                    return null;
                }).filter(Boolean) as AvailabilitySlot[];
            }

            setAvailabilities(slots);

            // Handle specific dates parsing if mixed in string (not implemented here for simplicity as we rely on separate lists)
            // For now, we assume specific dates are handled separately or we need to extract them from the string too if mixed

            // TODO: Extract specific dates from the string if they are mixed with recurring slots
            // The current serializer returns "Lundi : ... • 15/12/2024 : ..."
            // So we should parse both here

        } catch (err) {
            console.error('Failed to fetch availabilities:', err);
            setError('Erreur lors du chargement des disponibilités');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookedSlots = async () => {
        try {
            const bookings = await bookingsService.getMentorRequests();
            const booked = new Set<string>();
            const bookedDateTimes = new Set<string>();

            const now = new Date();
            // Reset hours to compare dates properly
            now.setHours(0, 0, 0, 0);

            bookings.forEach((booking: any) => {
                if (booking.status === 'CONFIRMED' || booking.status === 'PENDING') {
                    const bookingDate = new Date(booking.date);

                    // Only consider future or today's bookings
                    if (bookingDate >= now) {
                        const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][bookingDate.getDay()];
                        const time = booking.time.substring(0, 5);
                        booked.add(`${dayOfWeek}-${time}`);
                        bookedDateTimes.add(`${booking.date}-${time}`);
                    }
                }
            });

            setBookedSlots(booked);
            setBookedDates(bookedDateTimes);
        } catch (err) {
            console.error('Failed to fetch booked slots:', err);
        }
    };

    // Recurring slots functions
    const addSlot = () => {
        setAvailabilities([
            ...availabilities,
            {
                day_of_week: 'MONDAY',
                start_time: '09:00',
                end_time: '17:00',
                tempId: `new-${Date.now()}` // Unique ID
            }
        ]);
    };

    const removeSlot = (index: number) => {

        const slot = availabilities[index];
        const hasBookings = checkSlotHasBookings(slot);

        if (hasBookings) {
            console.warn('⚠️ [FRONTEND] Deletion blocked due to existing bookings');
            alert('Impossible de supprimer ce créneau car il contient des rendez-vous confirmés ou en attente.');
            return;
        }

        const newSlots = availabilities.filter((_, i) => i !== index);
        setAvailabilities(newSlots);
    };

    const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
        const newSlots = [...availabilities];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setAvailabilities(newSlots);
    };

    const checkSlotHasBookings = (slot: AvailabilitySlot): boolean => {
        const startHour = parseInt(slot.start_time.split(':')[0]);
        const endHour = parseInt(slot.end_time.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const key = `${slot.day_of_week}-${timeStr}`;
            if (bookedSlots.has(key)) {
                return true;
            }
        }

        return false;
    };

    // Specific dates functions
    const addSpecificDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        setSpecificDates([
            ...specificDates,
            { date: dateStr, start_time: '09:00', end_time: '17:00' }
        ]);
    };

    const removeSpecificDate = (index: number) => {
        const slot = specificDates[index];
        const hasBookings = checkSpecificDateHasBookings(slot);

        if (hasBookings) {
            console.warn('⚠️ [FRONTEND] Deletion blocked due to existing bookings');
            alert('Impossible de supprimer cette date car elle contient des rendez-vous confirmés ou en attente.');
            return;
        }

        const newDates = specificDates.filter((_, i) => i !== index);
        setSpecificDates(newDates);
    };

    const updateSpecificDate = (index: number, field: keyof SpecificDateSlot, value: string) => {
        // Si on change la date, vérifier qu'elle n'a pas de rendez-vous
        if (field === 'date') {
            const dateHasBookings = checkDateHasAnyBookings(value);
            if (dateHasBookings) {
                alert(`Impossible de sélectionner le ${new Date(value).toLocaleDateString('fr-FR')} car cette date contient déjà des rendez-vous confirmés ou en attente. Veuillez d'abord annuler les rendez-vous existants.`);
                return;
            }
        }

        const newDates = [...specificDates];
        newDates[index] = { ...newDates[index], [field]: value };
        setSpecificDates(newDates);
    };

    const checkSpecificDateHasBookings = (slot: SpecificDateSlot): boolean => {
        const startHour = parseInt(slot.start_time.split(':')[0]);
        const endHour = parseInt(slot.end_time.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            if (bookedDates.has(`${slot.date}-${timeStr}`)) {
                return true;
            }
        }
        return false;
    };

    const validateSlots = (): boolean => {
        // Helper to check overlap between two time ranges
        const hasOverlap = (start1: string, end1: string, start2: string, end2: string) => {
            return start1 < end2 && start2 < end1;
        };

        // Validate recurring slots
        for (let i = 0; i < availabilities.length; i++) {
            const slot1 = availabilities[i];

            if (slot1.start_time >= slot1.end_time) {
                setError(`L'heure de début doit être avant l'heure de fin pour le créneau du ${slot1.day_of_week}`);
                return false;
            }

            // Check overlap with other recurring slots of the same day
            for (let j = i + 1; j < availabilities.length; j++) {
                const slot2 = availabilities[j];
                if (slot1.day_of_week === slot2.day_of_week) {
                    if (hasOverlap(slot1.start_time, slot1.end_time, slot2.start_time, slot2.end_time)) {
                        setError(`Chevauchement détecté pour ${slot1.day_of_week} entre ${slot1.start_time}-${slot1.end_time} et ${slot2.start_time}-${slot2.end_time}`);
                        return false;
                    }
                }
            }
        }

        // Validate specific dates
        for (let i = 0; i < specificDates.length; i++) {
            const slot1 = specificDates[i];

            if (slot1.start_time >= slot1.end_time) {
                setError(`L'heure de début doit être avant l'heure de fin pour la date du ${new Date(slot1.date).toLocaleDateString('fr-FR')}`);
                return false;
            }

            const slotDate = new Date(slot1.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (slotDate < today) {
                setError('Les dates spécifiques doivent être dans le futur');
                return false;
            }

            // Vérifier si cette date a déjà des rendez-vous
            const dateHasBookings = checkDateHasAnyBookings(slot1.date);
            if (dateHasBookings) {
                setError(`Impossible d'ajouter un créneau le ${new Date(slot1.date).toLocaleDateString('fr-FR')} car cette date contient déjà des rendez-vous confirmés ou en attente.`);
                return false;
            }

            // Check overlap with other specific dates
            for (let j = i + 1; j < specificDates.length; j++) {
                const slot2 = specificDates[j];
                if (slot1.date === slot2.date) {
                    if (hasOverlap(slot1.start_time, slot1.end_time, slot2.start_time, slot2.end_time)) {
                        setError(`Chevauchement détecté le ${new Date(slot1.date).toLocaleDateString('fr-FR')} entre ${slot1.start_time}-${slot1.end_time} et ${slot2.start_time}-${slot2.end_time}`);
                        return false;
                    }
                }
            }
        }

        // Vérifier les doublons de dates spécifiques (déjà couvert par overlap mais gardons pour sécurité)
        const dateSet = new Set<string>();
        for (const slot of specificDates) {
            const key = `${slot.date}-${slot.start_time}`;
            if (dateSet.has(key)) {
                setError('Vous avez des créneaux en double pour la même date et heure');
                return false;
            }
            dateSet.add(key);
        }

        setError(null);
        return true;
    };

    // Nouvelle fonction pour vérifier si une date a des rendez-vous
    const checkDateHasAnyBookings = (dateStr: string): boolean => {
        // Vérifier si cette date a des rendez-vous (peu importe l'heure)
        for (const bookedDateTime of bookedDates) {
            if (bookedDateTime.startsWith(dateStr)) {
                return true;
            }
        }
        return false;
    };

    const handleSave = async () => {

        if (!validateSlots()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Transform to backend format - combine recurring and specific
            const availabilitiesList = [
                ...availabilities.map(slot => ({
                    day_of_week: slot.day_of_week,
                    start_time: slot.start_time,
                    end_time: slot.end_time
                })),
                ...specificDates.map(slot => ({
                    specific_date: slot.date,
                    start_time: slot.start_time,
                    end_time: slot.end_time
                }))
            ];

            const response = await mentorService.updateMyMentorProfile({
                availabilities: availabilitiesList as any
            });

            if (onSave) onSave();
            onClose();
        } catch (err: any) {
            console.error('❌ [FRONTEND] Save failed:', err);
            console.error('📋 [FRONTEND] Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-edu-primary text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-edu-accent p-2 rounded-lg text-edu-primary">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Gérer mes disponibilités</h3>
                            <p className="text-xs text-blue-200">Définissez vos créneaux récurrents et dates spécifiques</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={() => setActiveTab('recurring')}
                        className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'recurring'
                            ? 'bg-white dark:bg-gray-800 text-edu-secondary border-b-2 border-edu-secondary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <Repeat size={18} />
                        Créneaux hebdomadaires
                    </button>
                    <button
                        onClick={() => setActiveTab('specific')}
                        className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'specific'
                            ? 'bg-white dark:bg-gray-800 text-edu-secondary border-b-2 border-edu-secondary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <CalendarDays size={18} />
                        Dates spécifiques ({specificDates.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Info Alert */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 mb-6">
                                <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Important</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                                        {activeTab === 'recurring'
                                            ? 'Les créneaux hebdomadaires se répètent chaque semaine. Vous ne pouvez pas supprimer ou modifier des créneaux qui contiennent déjà des rendez-vous.'
                                            : 'Les dates spécifiques sont des disponibilités ponctuelles qui ne se répètent pas. Idéal pour des événements exceptionnels ou des disponibilités temporaires.'
                                        }
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm font-medium mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Recurring Slots Tab */}
                            {activeTab === 'recurring' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Créneaux hebdomadaires récurrents</h4>
                                        <button
                                            type="button"
                                            onClick={addSlot}
                                            className="flex items-center gap-2 px-4 py-2 bg-edu-secondary text-white rounded-lg text-sm font-medium hover:bg-edu-primary transition-colors"
                                        >
                                            <Plus size={16} />
                                            Ajouter un créneau
                                        </button>
                                    </div>

                                    {availabilities.map((slot, index) => {
                                        const hasBookings = checkSlotHasBookings(slot);

                                        return (
                                            <div
                                                key={slot.tempId || slot.id || index}
                                                className={`flex flex-wrap md:flex-nowrap items-center gap-3 p-4 rounded-xl border ${hasBookings
                                                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <select
                                                    value={slot.day_of_week}
                                                    onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                                                    disabled={hasBookings}
                                                    className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {DAYS.map(day => (
                                                        <option key={day.value} value={day.value}>{day.label}</option>
                                                    ))}
                                                </select>

                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <input
                                                        type="time"
                                                        value={slot.start_time}
                                                        onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                                                        disabled={hasBookings}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <span className="text-gray-400">-</span>
                                                    <input
                                                        type="time"
                                                        value={slot.end_time}
                                                        onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                                                        disabled={hasBookings}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(index)}
                                                    disabled={hasBookings}
                                                    className={`p-2 rounded-lg transition-colors ${hasBookings
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                        }`}
                                                    title={hasBookings ? 'Créneau avec rendez-vous' : 'Supprimer ce créneau'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                {hasBookings && (
                                                    <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                                                        Rendez-vous existants
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {availabilities.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            Aucun créneau défini. Cliquez sur "Ajouter un créneau" pour commencer.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Specific Dates Tab */}
                            {activeTab === 'specific' && (
                                <div className="space-y-4">
                                    {/* Dates occupées - Warning */}
                                    {Array.from(bookedDates).length > 0 && (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
                                            <div className="flex gap-3">
                                                <AlertCircle className="text-orange-600 dark:text-orange-400 shrink-0" size={20} />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm mb-2">Dates avec rendez-vous existants</h4>
                                                    <p className="text-xs text-orange-700 dark:text-orange-200 mb-2">
                                                        Les dates suivantes contiennent des rendez-vous confirmés ou en attente. Vous ne pouvez pas ajouter de nouveaux créneaux sur ces dates :
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.from(new Set(Array.from(bookedDates).map(dt => dt.split('-').slice(0, 3).join('-')))).map(date => (
                                                            <span key={date} className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                                                                {new Date(date).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Dates spécifiques ponctuelles</h4>
                                        <button
                                            type="button"
                                            onClick={addSpecificDate}
                                            className="flex items-center gap-2 px-4 py-2 bg-edu-secondary text-white rounded-lg text-sm font-medium hover:bg-edu-primary transition-colors"
                                        >
                                            <Plus size={16} />
                                            Ajouter une date
                                        </button>
                                    </div>

                                    {specificDates.map((slot, index) => {
                                        const hasBookings = checkSpecificDateHasBookings(slot);

                                        return (
                                            <div
                                                key={slot.id || index}
                                                className={`flex flex-wrap md:flex-nowrap items-center gap-3 p-4 rounded-xl border ${hasBookings
                                                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <input
                                                    type="date"
                                                    value={slot.date}
                                                    onChange={(e) => updateSpecificDate(index, 'date', e.target.value)}
                                                    disabled={hasBookings}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                />

                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <input
                                                        type="time"
                                                        value={slot.start_time}
                                                        onChange={(e) => updateSpecificDate(index, 'start_time', e.target.value)}
                                                        disabled={hasBookings}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <span className="text-gray-400">-</span>
                                                    <input
                                                        type="time"
                                                        value={slot.end_time}
                                                        onChange={(e) => updateSpecificDate(index, 'end_time', e.target.value)}
                                                        disabled={hasBookings}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecificDate(index)}
                                                    disabled={hasBookings}
                                                    className={`p-2 rounded-lg transition-colors ${hasBookings
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                        }`}
                                                    title={hasBookings ? 'Date avec rendez-vous' : 'Supprimer cette date'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                {hasBookings && (
                                                    <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                                                        Rendez-vous existants
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {specificDates.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            Aucune date spécifique définie. Cliquez sur "Ajouter une date" pour commencer.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-8 py-3 text-sm font-bold text-edu-primary bg-edu-accent hover:bg-yellow-300 rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-edu-primary"></div>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageAvailabilityModal;
