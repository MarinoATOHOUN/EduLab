import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/'); // Redirection vers l'accueil après connexion
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Échec de la connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Section Gauche - Image/Branding */}
        <div className="md:w-1/2 bg-edu-primary text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <img src="/logo.png" alt="EduLab Africa" className="h-24 w-auto object-contain bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Bon retour parmi nous !</h2>
            <p className="text-blue-200">Reprenez votre apprentissage là où vous l'avez laissé et connectez-vous avec vos mentors.</p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <p className="text-sm italic mb-2">"L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde."</p>
              <p className="text-xs font-bold text-edu-accent">— Nelson Mandela</p>
            </div>
          </div>

          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-edu-secondary rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-edu-accent rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl opacity-20"></div>
        </div>

        {/* Section Droite - Formulaire */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h3 className="text-2xl font-bold text-edu-primary dark:text-white mb-6 text-center md:text-left">Connexion</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email académique</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-edu-secondary focus:border-transparent outline-none transition-all"
                  placeholder="etudiant@universite.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                <a href="#" className="text-xs font-medium text-edu-secondary hover:text-edu-primary dark:text-blue-400">Mot de passe oublié ?</a>
              </div>
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

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-edu-secondary focus:ring-edu-secondary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-edu-secondary hover:bg-edu-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edu-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-bold text-edu-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Hypee</span>Connect
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-edu-secondary hover:text-edu-primary dark:text-blue-400 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;