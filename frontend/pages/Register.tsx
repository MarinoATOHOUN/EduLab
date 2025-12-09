import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, GraduationCap, Check, Building, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { countries } from 'countries-list';

const countryNames = Object.values(countries).map(c => c.name).sort();

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    country: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, role, formData.university, formData.country);
      navigate('/'); // Redirection vers l'accueil
    } catch (error: any) {
      console.error("Registration failed", error);
      alert("Échec de l'inscription. " + (error.response?.data?.email ? "Cet email est déjà utilisé." : "Veuillez réessayer."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse">

        {/* Section Image/Info */}
        <div className="md:w-5/12 bg-edu-secondary text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-center mb-8">
            <img src="/logo.png" alt="EduLab Africa" className="h-24 w-auto object-contain bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Rejoignez la communauté</h2>
          <ul className="space-y-4 mt-6 text-blue-100">
            <li className="flex items-start gap-3">
              <div className="bg-white/20 p-1 rounded-full mt-0.5"><Check size={14} /></div>
              <span>Accédez à des milliers de ressources académiques</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white/20 p-1 rounded-full mt-0.5"><Check size={14} /></div>
              <span>Trouvez un mentor pour vous guider</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white/20 p-1 rounded-full mt-0.5"><Check size={14} /></div>
              <span>Décrochez des bourses d'études</span>
            </li>
          </ul>
        </div>

        {/* Cercles décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-edu-primary rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-edu-accent rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-20"></div>


        {/* Section Formulaire */}
        <div className="md:w-7/12 p-8 md:p-12">
          <div className="max-w-md mx-auto md:max-w-none">
            <h3 className="text-2xl font-bold text-edu-primary dark:text-white mb-2">Créer un compte</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Commencez votre voyage d'apprentissage dès aujourd'hui.</p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Sélecteur de Rôle */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setRole(UserRole.STUDENT)}
                  className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === UserRole.STUDENT
                    ? 'border-edu-secondary bg-blue-50 dark:bg-blue-900/20 text-edu-secondary dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500'
                    }`}
                >
                  <User size={24} />
                  <span className="font-bold text-sm">Étudiant</span>
                </div>
                <div
                  onClick={() => setRole(UserRole.MENTOR)}
                  className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === UserRole.MENTOR
                    ? 'border-edu-secondary bg-blue-50 dark:bg-blue-900/20 text-edu-secondary dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500'
                    }`}
                >
                  <BookOpen size={24} />
                  <span className="font-bold text-sm">Mentor</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                    placeholder="Amara Diop"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                    placeholder="exemple@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom école / université</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                    placeholder="Université de ..."
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pays</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="" disabled>Sélectionnez votre pays</option>
                    {countryNames.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start mt-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 mt-1 text-edu-secondary focus:ring-edu-secondary border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  J'accepte les <Link to="/terms" className="text-edu-secondary font-medium hover:underline">Conditions d'utilisation</Link> et la <Link to="/privacy" className="text-edu-secondary font-medium hover:underline">Politique de confidentialité</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-edu-primary hover:bg-edu-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edu-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "S'inscrire gratuitement"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-edu-secondary hover:text-edu-primary dark:text-blue-400 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;