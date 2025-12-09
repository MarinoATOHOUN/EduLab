import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, User, MapPin, BookOpen, GraduationCap, Link as LinkIcon, Linkedin, Twitter, Globe, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { user, updateUser, mentorProfile, updateMentorProfile } = useAuth();

    // Basic User Form Data
    const [userData, setUserData] = useState({
        name: '',
        university: '',
        country: '',
        avatar: ''
    });

    // Mentor Specific Form Data
    const [mentorData, setMentorData] = useState({
        bio: '',
        linkedin: '',
        twitter: '',
        website: ''
    });

    const [specialties, setSpecialties] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize data when modal opens
    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                university: user.university || '',
                country: user.country || '',
                avatar: user.avatar || ''
            });
        }

        if (user?.role === UserRole.MENTOR && mentorProfile) {
            setMentorData({
                bio: mentorProfile.bio || '',
                linkedin: mentorProfile.socials?.linkedin || '',
                twitter: mentorProfile.socials?.twitter || '',
                website: mentorProfile.socials?.website || ''
            });
            setSpecialties(mentorProfile.specialties || []);
        }
    }, [user, mentorProfile, isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // Upload avatar if changed
            if (userData.avatar && userData.avatar.startsWith('data:')) {
                // Convert base64 to File
                const response = await fetch(userData.avatar);
                const blob = await response.blob();
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

                // Upload avatar (this creates the UserAvatar record automatically)
                const { authService } = await import('../services');
                await authService.uploadAvatar(file);

                // Refresh user data to get the new avatar URL
                await refreshUser();
            }

            // Update basic user info (name, country, university) - never send avatar here
            const dataToSend: any = {};
            if (userData.name && userData.name !== user.name) dataToSend.name = userData.name;
            if (userData.country && userData.country !== user.country) dataToSend.country = userData.country;
            if (userData.university && userData.university !== user.university) dataToSend.university = userData.university;

            // Only update if there are changes
            if (Object.keys(dataToSend).length > 0) {
                await updateUser(dataToSend);
            }

            // Update mentor info if applicable
            if (user.role === UserRole.MENTOR) {
                await updateMentorProfile({
                    bio: mentorData.bio,
                    specialties: specialties,
                    socials: {
                        linkedin: mentorData.linkedin,
                        twitter: mentorData.twitter,
                        website: mentorData.website
                    }
                });
            }

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Tag Handling for Specialties
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !specialties.includes(newTag)) {
                setSpecialties([...specialties, newTag]);
            }
            setTagInput('');
        } else if (e.key === 'Backspace' && !tagInput && specialties.length > 0) {
            setSpecialties(specialties.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSpecialties(specialties.filter(tag => tag !== tagToRemove));
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Modifier mon profil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <img
                                    src={userData.avatar}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-edu-secondary font-medium hover:underline">
                                Changer la photo
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={e => setUserData({ ...userData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Pays</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={userData.country}
                                        onChange={e => setUserData({ ...userData, country: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Université / École</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={userData.university}
                                    onChange={e => setUserData({ ...userData, university: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Mentor Specifics (Conditional) */}
                    {user.role === UserRole.MENTOR && (
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="font-bold text-edu-primary dark:text-white flex items-center gap-2">
                                <GraduationCap className="text-edu-secondary" />
                                Informations Mentor
                            </h4>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Biographie</label>
                                <textarea
                                    value={mentorData.bio}
                                    onChange={e => setMentorData({ ...mentorData, bio: e.target.value })}
                                    className="w-full p-4 h-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white resize-none"
                                    placeholder="Présentez votre expertise aux étudiants..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Spécialités</label>
                                <div className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-edu-secondary transition-shadow flex flex-wrap gap-2 items-center">
                                    {specialties.map(tag => (
                                        <span key={tag} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagInputKeyDown}
                                        className="flex-grow bg-transparent outline-none min-w-[120px] dark:text-white placeholder-gray-400"
                                        placeholder={specialties.length === 0 ? "Ex: Finance, Python (Espace)" : ""}
                                    />
                                </div>
                            </div>



                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                                    <input
                                        type="url"
                                        value={mentorData.linkedin}
                                        onChange={e => setMentorData({ ...mentorData, linkedin: e.target.value })}
                                        placeholder="LinkedIn"
                                        className="w-full pl-10 pr-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                    <input
                                        type="url"
                                        value={mentorData.twitter}
                                        onChange={e => setMentorData({ ...mentorData, twitter: e.target.value })}
                                        placeholder="Twitter"
                                        className="w-full pl-10 pr-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="url"
                                        value={mentorData.website}
                                        onChange={e => setMentorData({ ...mentorData, website: e.target.value })}
                                        placeholder="Site Web"
                                        className="w-full pl-10 pr-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </form>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" disabled={isUploading}>
                        Annuler
                    </button>
                    <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-edu-secondary hover:bg-edu-primary shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
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

export default EditProfileModal;