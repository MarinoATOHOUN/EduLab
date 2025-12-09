# 📬 Système de Notifications - EduConnect Africa

## Vue d'ensemble

Le système de notifications d'EduConnect Africa envoie automatiquement des alertes contextuelles aux utilisateurs pour améliorer l'engagement et l'expérience utilisateur.

## Types de Notifications

### 1. 🔔 Notifications de Réservation (BOOKING)

#### Nouvelle demande de mentorat
- **Destinataire** : Mentor
- **Déclencheur** : Un étudiant crée une nouvelle réservation
- **Message** : "Nouvelle demande de mentorat - [Nom étudiant] souhaite réserver une session avec vous le [date] à [heure]"

#### Mise à jour de statut
- **Destinataire** : Étudiant
- **Déclencheur** : Le mentor accepte/refuse/annule une réservation
- **Messages** :
  - Acceptée : "Votre demande de mentorat a été acceptée"
  - Refusée : "Votre demande de mentorat a été déclinée"
  - Terminée : "Votre session de mentorat est terminée"
  - Annulée : "Votre session de mentorat a été annulée"

#### Rappel de rendez-vous (24h avant)
- **Destinataires** : Étudiant ET Mentor
- **Déclencheur** : Commande automatisée (cronjob)
- **Message** : "Il reste 24 heures avant votre session de mentorat"

#### Rendez-vous imminent
- **Destinataires** : Étudiant ET Mentor
- **Déclencheur** : Commande automatisée (cronjob)
- **Messages** :
  - Étudiant : "Votre session de mentorat commence bientôt. Connectez-vous maintenant."
  - Mentor : "Votre session de mentorat commence bientôt. L'étudiant vous attend."

### 2. 💬 Notifications de Réponses (REPLY)

- **Destinataire** : Auteur de la question
- **Déclencheur** : Quelqu'un répond à sa question sur le forum
- **Message** : "[Nom] a répondu à [titre de la question]"

### 3. 📨 Notifications de Messages (MESSAGE)

- **Destinataire** : Participants de la conversation
- **Déclencheur** : Nouveau message dans une conversation
- **Message** : "[Nom]: [Aperçu du message]..."

### 4. 🏆 Notifications de Succès (ACHIEVEMENT)

- **Destinataire** : Utilisateur qui débloque un badge
- **Déclencheur** : Attribution d'un nouveau badge
- **Message** : "Félicitations ! Vous avez débloqué le badge \"[Nom du badge]\""

### 5. 🎓 Suggestions de Mentors (MENTORSHIP)

- **Destinataire** : Étudiants
- **Déclencheur** : Commande automatisée (recommandation intelligente)
- **Message** : "Un nouveau profil de mentor pourrait vous intéresser : [Nom]. Jetez un œil !"

### 6. 🔄 Réengagement (SYSTEM)

- **Destinataire** : Utilisateurs inactifs sur certains outils
- **Déclencheur** : Commande automatisée
- **Message** : "Vous n'avez pas utilisé [Nom de l'outil] récemment. Venez découvrir les nouveautés !"
- **Outils concernés** :
  - Calculatrice Scientifique
  - Atelier d'Écriture
  - Atlas Interactif
  - Atelier de Coloriage

## Utilisation de la Commande de Gestion

### Commande de base
```bash
python manage.py send_notifications
```
Cette commande envoie tous les types de notifications automatiques (rappels, recommandations, réengagement).

### Commandes spécifiques

#### Envoyer uniquement les rappels de rendez-vous
```bash
python manage.py send_notifications --type reminder
```

#### Envoyer uniquement les recommandations de mentors
```bash
python manage.py send_notifications --type recommendation
```

#### Envoyer uniquement les notifications de réengagement
```bash
python manage.py send_notifications --type reengagement
```

#### Cibler un utilisateur spécifique (pour les tests)
```bash
python manage.py send_notifications --type recommendation --user_email user@example.com
```

## Configuration d'un Cronjob

Pour automatiser l'envoi de notifications, configurez un cronjob :

```bash
# Ouvrir l'éditeur crontab
crontab -e

# Ajouter les tâches suivantes :

# Rappels 24h avant (tous les jours à 9h)
0 9 * * * cd /path/to/educonnect/backend && /path/to/venv/bin/python manage.py send_notifications --type reminder

# Recommandations de mentors (tous les lundis à 10h)
0 10 * * 1 cd /path/to/educonnect/backend && /path/to/venv/bin/python manage.py send_notifications --type recommendation

# Réengagement (tous les vendredis à 14h)
0 14 * * 5 cd /path/to/educonnect/backend && /path/to/venv/bin/python manage.py send_notifications --type reengagement
```

## Architecture Technique

### Backend

#### Modèle de données (`apps/notifications/models.py`)
- `Notification` : Table principale avec type, lien, statut de lecture
- `NotificationTitle` : Titres versionnés
- `NotificationMessage` : Messages versionnés
- `NotificationReadHistory` : Traçabilité des lectures

#### Service (`apps/notifications/services.py`)
La classe `NotificationService` centralise la création de toutes les notifications :
- `create_booking_notification(booking)`
- `create_booking_status_notification(booking)`
- `create_booking_reminder(booking, hours_left)`
- `create_booking_starting_soon(booking)`
- `create_answer_notification(answer)`
- `create_message_notifications(message)`
- `create_badge_notification(user_badge)`
- `create_mentor_recommendation(user, mentor_profile)`
- `create_tool_reengagement(user, tool_name, tool_link)`

#### API (`apps/notifications/views.py`)
- `GET /api/notifications/` : Liste des notifications de l'utilisateur
- `POST /api/notifications/{id}/mark-read/` : Marquer comme lue
- `POST /api/notifications/mark-all-read/` : Tout marquer comme lu
- `DELETE /api/notifications/{id}/` : Supprimer une notification

### Frontend

#### Page de notifications (`frontend/pages/Notifications.tsx`)
- Affichage de toutes les notifications
- Icônes différenciées par type
- Indicateur visuel pour les non-lues
- Actions : marquer comme lu, supprimer, voir les détails

#### Contexte d'authentification (`frontend/context/AuthContext.tsx`)
- Gestion globale des notifications
- Méthodes : `markAsRead()`, `markAllAsRead()`, `deleteNotification()`
- Synchronisation avec le backend

## Améliorations Futures

1. **Notifications Push** : Intégrer Firebase Cloud Messaging ou OneSignal
2. **Préférences utilisateur** : Permettre de désactiver certains types de notifications
3. **Notifications par email** : Envoyer également par email pour les événements importants
4. **Notifications en temps réel** : Utiliser WebSockets (Django Channels) pour les mises à jour instantanées
5. **Analytics** : Tracker le taux d'ouverture et d'engagement des notifications
6. **Personnalisation** : Recommandations basées sur l'historique et les préférences de l'utilisateur

## Exemples de Résultats

Après avoir exécuté la commande de test :
```bash
python manage.py send_notifications
```

Résultat :
```
Checking for booking reminders...
Sent 0 24h reminders.
Sending mentor recommendations...
Sent 21 recommendations.
Sending re-engagement notifications...
Sent 32 re-engagement notifications.
```

Les utilisateurs verront ces notifications dans leur page `/notifications` avec :
- Un badge de compteur sur l'icône de notification dans le header
- Des cartes visuelles avec icônes colorées selon le type
- Des liens directs vers les ressources concernées
- La possibilité de marquer comme lu ou supprimer

---

**Développé avec ❤️ par Marino ATOHOUN pour Hypee**
