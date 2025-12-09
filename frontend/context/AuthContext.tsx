
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification, Mentor } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_MENTORS, BADGES } from '../constants';
import { authService, mentorService, notificationService } from '../services';

interface AuthContextType {
  user: User | null;
  mentorProfile: Mentor | null;
  isAuthenticated: boolean;
  loading: boolean;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, university?: string, country?: string) => Promise<void>;
  logout: () => void;
  gainPoints: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateMentorProfile: (data: Partial<Mentor>) => void;
  refreshUser: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  mentorProfile: null,
  isAuthenticated: false,
  loading: true,
  notifications: [],
  login: async (email, password) => { },
  register: async (name, email, password, role, university, country) => { },
  logout: () => { },
  gainPoints: () => { },
  unlockBadge: () => { },
  updateUser: async () => { },
  updateMentorProfile: () => { },
  refreshUser: async () => { },
  markAsRead: () => { },
  markAllAsRead: () => { },
  deleteNotification: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map backend user to frontend user
  const mapBackendUserToFrontend = (backendUser: any): User => {
    let avatarUrl = backendUser.profile?.avatar;

    // Si l'URL est relative (commence par /media), ajouter le domaine du backend
    if (avatarUrl && avatarUrl.startsWith('/media')) {
      avatarUrl = `http://127.0.0.1:8000${avatarUrl}`;
    }
    // Si pas d'avatar, utiliser UI Avatars
    else if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.profile?.name || 'User')}&background=random`;
    }

    return {
      id: backendUser.id.toString(),
      email: backendUser.email, // Add email to type if needed, or just keep it here
      name: backendUser.profile?.name || 'Utilisateur',
      avatar: avatarUrl,
      role: backendUser.role as UserRole,
      points: backendUser.points,
      badges: [], // TODO: Fetch badges from backend
      university: backendUser.profile?.university,
      country: backendUser.profile?.country || 'Afrique',
      public_key: backendUser.profile?.public_key,
      encrypted_private_key: backendUser.profile?.encrypted_private_key,
      mentor_application_status: backendUser.mentor_application_status,
    } as User;
  };

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(mapBackendUserToFrontend(userData));
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(mapBackendUserToFrontend(userData));
        } catch (error) {
          console.error("Session expired or invalid", error);
          authService.logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch notifications and connect WS when user is set
  useEffect(() => {
    if (user) {
      fetchNotifications();

      const socket = notificationService.connectToNotifications((newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      });

      return () => {
        socket.close();
      };
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Sync mentor profile when user changes
  useEffect(() => {
    if (user && user.role === UserRole.MENTOR) {
      // TODO: Fetch real mentor profile from backend
      const existingMentor = MOCK_MENTORS.find(m => m.user.id === user.id);
      if (existingMentor) {
        setMentorProfile(existingMentor);
      } else if (!mentorProfile) {
        setMentorProfile({
          id: `m_${user.id}`,
          user: user,
          specialties: [],
          bio: '',
          rating: 0,
          reviews: 0,
          availability: '',
          socials: {}
        });
      }
    } else {
      setMentorProfile(null);
    }
  }, [user]);

  const addNotification = (title: string, message: string, type: 'SYSTEM' | 'REPLY' | 'MENTORSHIP' | 'ACHIEVEMENT', link?: string) => {
    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      userId: user?.id || 'guest',
      title,
      message,
      type,
      createdAt: "À l'instant",
      isRead: false,
      link
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(mapBackendUserToFrontend(data.user));
    addNotification('Bon retour !', `Heureux de vous revoir.`, 'SYSTEM');
  };

  const register = async (name: string, email: string, password: string, role: UserRole, university?: string, country?: string) => {
    const data = await authService.register(name, email, password, role, university, country);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(mapBackendUserToFrontend(data.user));
    addNotification('Bienvenue !', 'Votre compte a été créé avec succès.', 'SYSTEM');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setMentorProfile(null);
  };

  const unlockBadge = (badgeId: string) => {
    if (!user) return;
    // TODO: Call backend to unlock badge
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      // Optimistic update
      addNotification('Nouveau Badge !', `Vous avez débloqué "${badge.name}".`, 'ACHIEVEMENT');
    }
  };

  const gainPoints = (amount: number) => {
    if (!user) return;
    // TODO: Call backend to add points
    setUser(prev => prev ? { ...prev, points: prev.points + amount } : null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await authService.updateProfile(data);
        setUser(mapBackendUserToFrontend(updatedUser));
        addNotification('Profil mis à jour', 'Vos informations ont été enregistrées.', 'SYSTEM');
      } catch (error) {
        console.error("Failed to update profile", error);
        addNotification('Erreur', 'Impossible de mettre à jour le profil.', 'SYSTEM');
      }
    }
  };

  const updateMentorProfile = async (data: Partial<Mentor>) => {
    if (mentorProfile && user?.role === 'MENTOR') {
      try {
        // Appeler l'API pour mettre à jour le profil mentor
        const updatedProfile = await mentorService.updateMyMentorProfile({
          bio: data.bio,
          specialties: data.specialties,
          availability: data.availability,
          socials: data.socials
        });

        // Mettre à jour l'état local
        setMentorProfile(updatedProfile);
        addNotification('Profil Mentor mis à jour', 'Vos informations professionnelles ont été actualisées.', 'SYSTEM');
      } catch (error) {
        console.error("Failed to update mentor profile", error);
        addNotification('Erreur', 'Impossible de mettre à jour le profil mentor.', 'SYSTEM');
      }
    }
  };

  const refreshUser = async () => {
    await fetchUser();
    await fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      mentorProfile,
      isAuthenticated: !!user,
      loading,
      notifications,
      login,
      register,
      logout,
      gainPoints,
      unlockBadge,
      updateUser,
      updateMentorProfile,
      refreshUser,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);