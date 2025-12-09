import React from 'react';
import { Bell, Check, Info, MessageCircle, Award, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Notifications: React.FC = () => {
  // Utilisation du contexte d'authentification pour accéder aux notifications réelles
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useAuth();

  const getIcon = (type: string) => {
    switch (type) {
      case 'REPLY': return <MessageCircle size={20} className="text-blue-500" />;
      case 'MESSAGE': return <MessageCircle size={20} className="text-green-500" />;
      case 'ACHIEVEMENT': return <Award size={20} className="text-yellow-500" />;
      case 'MENTORSHIP': return <Calendar size={20} className="text-purple-500" />;
      case 'BOOKING': return <Calendar size={20} className="text-indigo-500" />;
      case 'SYSTEM': return <Info size={20} className="text-gray-500" />;
      default: return <Info size={20} className="text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-edu-secondary/10 rounded-full text-edu-secondary">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-edu-primary dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Restez informé de vos activités.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-edu-secondary hover:text-edu-primary dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Check size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 border transition-all duration-200 ${!notification.isRead
                  ? 'border-edu-secondary/30 shadow-md bg-blue-50/30 dark:bg-blue-900/10'
                  : 'border-gray-100 dark:border-gray-700 hover:shadow-sm'
                }`}
            >
              {!notification.isRead && (
                <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-edu-accent rounded-full animate-pulse"></div>
              )}

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${!notification.isRead ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-gray-100 dark:bg-gray-900'
                  }`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-grow pr-8">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base font-bold ${!notification.isRead ? 'text-edu-primary dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4">
                    {notification.link && (
                      <Link
                        to={notification.link}
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-bold text-edu-secondary hover:underline flex items-center gap-1"
                      >
                        Voir les détails <ArrowRight size={12} />
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">Aucune notification</h3>
          <p className="text-gray-500 dark:text-gray-400">Vous êtes à jour !</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;