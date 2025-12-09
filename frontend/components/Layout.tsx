import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, BookOpen, Users, Award, Brain, Sun, Moon, Globe, LogIn, UserPlus, MessageCircle, Bell, LogOut, Wrench, LayoutDashboard, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AskQuestionModal from './AskQuestionModal';
import { UserRole } from '../types';
import { socialLinkService, SocialLink } from '../services/socials';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, notifications } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Calcul dynamique des notifications non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const data = await socialLinkService.getSocialLinks();
        setSocialLinks(data);
      } catch (error) {
        console.error("Failed to fetch social links", error);
      }
    };
    fetchSocials();
  }, []);

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'Facebook': return <Facebook size={18} />;
      case 'Twitter': return <Twitter size={18} />;
      case 'Linkedin': return <Linkedin size={18} />;
      case 'Instagram': return <Instagram size={18} />;
      case 'Youtube': return <Youtube size={18} />;
      case 'Mail': return <Mail size={18} />;
      default: return <Globe size={18} />;
    }
  };

  const navItems = [
    { path: '/', label: 'Accueil', icon: <Globe size={20} /> },
    { path: '/questions', label: 'Questions', icon: <BookOpen size={20} /> },
    { path: '/mentors', label: 'Mentors', icon: <Users size={20} /> },
    { path: '/opportunities', label: 'Opportunités', icon: <GraduationCap size={20} /> },
    { path: '/tools', label: 'Outils Pratiques', icon: <Wrench size={20} /> },
    { path: '/chat', label: 'Messages', icon: <MessageCircle size={20} /> },
    { path: '/ai-tutor', label: 'Tuteur IA', icon: <Brain size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-edu-bg dark:bg-edu-darkbg text-edu-primary dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-edu-primary text-white shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <img src="/logo.png" alt="EduLab Africa" className="h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Nav - Optimized spacing for xl screens (Tablet/Laptop uses hamburger) */}
          <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-1.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${isActive(item.path)
                  ? 'bg-edu-secondary text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {/* Scale icon down slightly on medium screens */}
                <span className="scale-75 xl:scale-90">{item.icon}</span>
                <span className="text-[10px] xl:text-xs font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Mentor Dashboard Link (Desktop) */}
            {user?.role === UserRole.MENTOR && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-1.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap border border-edu-accent ${isActive('/dashboard')
                  ? 'bg-edu-accent text-edu-primary shadow-md font-bold'
                  : 'text-edu-accent hover:bg-edu-accent hover:text-edu-primary'
                  }`}
              >
                <LayoutDashboard size={16} />
                <span className="text-[10px] xl:text-xs font-medium">Tableau de bord</span>
              </Link>
            )}
          </nav>

          {/* User & Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 text-edu-accent transition-colors"
              title="Changer le thème"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated && (
              <Link
                to="/notifications"
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 rounded-full border border-edu-primary flex items-center justify-center text-[9px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/badges" className="flex items-center space-x-2 lg:space-x-3 bg-white/10 px-2 lg:px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="text-right hidden lg:block">
                    <div className="text-xs text-gray-300">{user.points} pts</div>
                    <div className="text-sm font-semibold leading-none max-w-[100px] truncate">{user.name}</div>
                  </div>
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border-2 border-edu-accent" />
                </Link>
                <Link
                  to="/settings"
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Paramètres"
                >
                  <Settings size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium text-white hover:text-edu-accent transition-colors whitespace-nowrap"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold bg-edu-accent text-edu-primary rounded-full hover:bg-white transition-colors whitespace-nowrap"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Menu Button - Visible until XL */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile/Tablet Navigation Drawer - Visible until XL */}
        {
          isMobileMenuOpen && (
            <div className="xl:hidden bg-edu-primary border-t border-white/10 animate-in slide-in-from-top-5">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${isActive(item.path) ? 'bg-edu-secondary text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Mentor Dashboard Link (Mobile) */}
                {user?.role === UserRole.MENTOR && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl border border-edu-accent ${isActive('/dashboard') ? 'bg-edu-accent text-edu-primary' : 'text-edu-accent hover:bg-white/5'
                      }`}
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-bold">Tableau de bord Mentor</span>
                  </Link>
                )}

                {/* Hide Auth Actions on Tablet (md) since they are visible in header */}
                <div className="border-t border-white/10 my-2 pt-4 flex flex-col gap-3 md:hidden">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/20 text-white hover:bg-white/10"
                      >
                        <LogIn size={18} />
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-edu-accent text-edu-primary font-bold hover:bg-white"
                      >
                        <UserPlus size={18} />
                        Inscription
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <img src={user?.avatar} alt="profile" className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-white font-bold">{user?.name}</div>
                          <div className="text-xs text-edu-accent">{user?.points} points</div>
                        </div>
                      </div>
                      <Link
                        to="/badges"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5"
                      >
                        <Award size={20} />
                        <span>Mes Badges</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5"
                      >
                        <Settings size={20} />
                        <span>Paramètres</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 w-full text-left"
                      >
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                      </button>
                    </>
                  )}

                  <div className="flex justify-between items-center px-2 mt-2">
                    {isAuthenticated && (
                      <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-400">
                        <div className="relative">
                          <Bell size={18} />
                          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </div>
                        <span className="text-sm">Notifications</span>
                      </Link>
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-sm text-gray-400">Mode Sombre</span>
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-white/10 text-edu-accent"
                      >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>

      {/* Global Modals */}
      <AskQuestionModal />

      {/* Footer */}
      <footer className="bg-edu-primary text-gray-400 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Une initiative Hypee</h3>
              <p className="text-sm mb-4">
                Développée au <strong>Bénin</strong>, EduLab pallie le manque de matériel dans le système éducatif africain.
              </p>
              <p className="text-sm text-edu-accent italic">
                "Nous transformons la théorie en savoir-faire concret pour la jeunesse active."
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Accès Direct</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/tools" className="hover:text-edu-accent">Outils Scientifiques</Link></li>
                <li><Link to="/questions" className="hover:text-edu-accent">Questions récentes</Link></li>
                <li><Link to="/mentors" className="hover:text-edu-accent">Mentorat</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Hypee Community</h3>
              <p className="text-sm mb-2">L'innovation sociale au service de l'éducation.</p>
              <div className="flex justify-center md:justify-start space-x-4">
                {socialLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 rounded-full hover:bg-edu-accent hover:text-edu-primary transition-colors cursor-pointer flex items-center justify-center"
                    title={link.name}
                  >
                    {getSocialIcon(link.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs text-center border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <span>© 2025 EduLab Africa. Fièrement propulsé par Hypee (Bénin).</span>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-edu-accent transition-colors">Conditions</Link>
              <Link to="/privacy" className="hover:text-edu-accent transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;