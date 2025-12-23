import React, { useState } from 'react';
import { X, CheckCircle2, Linkedin, Twitter, Globe, Clock, BookOpen, GraduationCap, Heart, Upload, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mentorService } from '../services';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
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

const BecomeMentorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { gainPoints, unlockBadge } = useAuth();
  const [formData, setFormData] = useState({
    university: '',
    bio: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { day: 'MONDAY', startTime: '18:00', endTime: '20:00' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const addAvailabilitySlot = () => {
    setAvailabilitySlots([...availabilitySlots, { day: 'MONDAY', startTime: '09:00', endTime: '11:00' }]);
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const newSlots = [...availabilitySlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setAvailabilitySlots(newSlots);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError("Le fichier CV doit être un PDF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Le fichier CV ne doit pas dépasser 5 Mo.");
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError("La photo d'identité doit être une image (JPG, PNG).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("La photo d'identité ne doit pas dépasser 5 Mo.");
        return;
      }
      setIdCardFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cvFile) {
      setError("Veuillez télécharger votre CV (PDF).");
      return;
    }

    if (!idCardFile) {
      setError("Veuillez télécharger votre photo d'identité.");
      return;
    }

    if (availabilitySlots.length === 0) {
      setError("Veuillez ajouter au moins une disponibilité.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('university', formData.university);
      data.append('bio', formData.bio);
      data.append('linkedin', formData.linkedin);
      data.append('twitter', formData.twitter);
      data.append('website', formData.website);
      data.append('cv_file', cvFile);
      data.append('id_card_photo', idCardFile);

      // JSON data
      data.append('specialties', JSON.stringify(specialties));
      data.append('availability', JSON.stringify(availabilitySlots));

      await mentorService.apply(data);

      alert("Félicitations ! Votre demande a été envoyée avec succès. Elle sera examinée par nos équipes sous 48h.");

      // Gamification (Optimistic UI)
      gainPoints(50); // Points pour la candidature

      onClose();
    } catch (err: any) {
      console.error("Erreur lors de la candidature:", err);
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'envoi de votre candidature.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 bg-edu-primary text-white">
          <div className="flex items-center gap-3">
            <div className="bg-edu-accent p-2 rounded-lg text-edu-primary">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl">Devenir Mentor</h3>
              <p className="text-xs text-blue-200">Partagez votre savoir et inspirez la communauté.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">

          {/* Note informative */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Processus de validation</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                Votre demande sera examinée par des professionnels de chez Hypee pour déterminer votre éligibilité.
                Vous recevrez une réponse sous <span className="font-bold">2 jours ouvrables</span> au plus.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Academic & Bio */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-edu-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Profil Académique</h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Université / Établissement</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                    placeholder="Ex: Université Cheikh Anta Diop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Spécialités (Expertise)</label>
                <div className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-edu-secondary transition-shadow flex flex-wrap gap-2 items-center min-h-[46px]">
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
                    placeholder={specialties.length === 0 ? "Ex: Finance, Python..." : ""}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Biographie</label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-4 h-32 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white resize-none"
                placeholder="Présentez-vous, votre parcours et votre approche pédagogique..."
              ></textarea>
            </div>

            {/* CV & ID Card Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Curriculum Vitae (CV)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative h-40">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-edu-secondary/10 p-3 rounded-full mb-3">
                    <Upload className="text-edu-secondary" size={24} />
                  </div>
                  {cvFile ? (
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1 px-2">{cvFile.name}</p>
                      <p className="text-xs text-gray-500">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Télécharger CV</p>
                      <p className="text-xs text-gray-500 mt-1">PDF uniquement (Max 5 Mo)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Photo d'Identité</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative h-40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-edu-accent/10 p-3 rounded-full mb-3">
                    <Upload className="text-edu-accent" size={24} />
                  </div>
                  {idCardFile ? (
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1 px-2">{idCardFile.name}</p>
                      <p className="text-xs text-gray-500">{(idCardFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Télécharger Photo ID</p>
                      <p className="text-xs text-gray-500 mt-1">Image JPG/PNG (Max 5 Mo)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-edu-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Engagement & Disponibilité</h4>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800">
              <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full text-blue-600 dark:text-blue-300 mt-0.5 shrink-0">
                <Heart size={16} className="fill-current" />
              </div>
              <div>
                <h5 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Mentorat 100% Bénévole</h5>
                <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
                  Sur EduLab Africa, le partage de connaissances est gratuit. En devenant mentor, vous rejoignez une communauté solidaire.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Vos Disponibilités</label>
                <button
                  type="button"
                  onClick={addAvailabilitySlot}
                  className="text-xs flex items-center gap-1 text-edu-secondary font-bold hover:underline"
                >
                  <Plus size={14} />
                  Ajouter un créneau
                </button>
              </div>

              {availabilitySlots.map((slot, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <select
                    value={slot.day}
                    onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                    className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                  >
                    {DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAvailabilitySlot(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
                    title="Supprimer ce créneau"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {availabilitySlots.length === 0 && (
                <p className="text-sm text-red-500 italic">Veuillez ajouter au moins une disponibilité.</p>
              )}
            </div>
          </div>

          {/* Section 3: Socials */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-edu-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Réseaux Sociaux</h4>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                  placeholder="Profil LinkedIn"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                  placeholder="Profil Twitter/X"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-edu-secondary outline-none dark:text-white"
                  placeholder="Site Web / Portfolio"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm font-bold text-edu-primary bg-edu-accent hover:bg-yellow-300 rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-edu-primary"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Valider ma candidature
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeMentorModal;