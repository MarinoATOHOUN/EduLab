# 🚀 Guide d'Intégration API - EduConnect Africa

> Développé par **Marino ATOHOUN** pour **Hypee**

## 📋 Vue d'ensemble

Ce document détaille comment utiliser les services API frontend pour communiquer avec le backend Django REST Framework.

---

## 🔐 Authentification

### Configuration
L'authentification utilise **JWT (JSON Web Tokens)** avec refresh automatique.

```typescript
import { authService } from './services';

// Connexion
await authService.login('email@example.com', 'password');
// Les tokens sont automatiquement stockés dans localStorage

// Inscription
await authService.register('John Doe', 'email@example.com', 'password', UserRole.STUDENT);

// Récupérer l'utilisateur connecté
const user = await authService.getCurrentUser();

// Mettre à jour le profil
await authService.updateProfile({ name: 'Nouveau nom', country: 'Bénin' });

// Déconnexion
authService.logout();
```

---

## 💬 Forum / Questions

### Récupérer les questions

```typescript
import { forumService } from './services';

// Toutes les questions (avec pagination)
const { count, results } = await forumService.getQuestions({
    page: 1,
    search: 'algorithme',
    filter: 'unsolved', // 'solved' | 'unsolved' | undefined
    tag: 'python'
});

// Une question spécifique
const question = await forumService.getQuestion('123');

// Créer une question
const newQuestion = await forumService.createQuestion({
    title: 'Comment optimiser mon code ?',
    content: 'J\'ai un problème de performance...',
    tags: ['python', 'performance']
});

// Voter pour une question
await forumService.voteQuestion('123', 1); // 1 = upvote, -1 = downvote
```

---

## 👨‍🏫 Mentors

### Recherche et profils mentors

```typescript
import { mentorService } from './services';

// Liste des mentors
const { count, results } = await mentorService.getMentors({
    page: 1,
    search: 'data science',
    country: 'Bénin',
    specialty: 'Machine Learning'
});

// Profil d'un mentor
const mentor = await mentorService.getMentor('123');

// Mon profil mentor (si je suis mentor)
const myProfile = await mentorService.getMyMentorProfile();

// Mettre à jour mon profil mentor
await mentorService.updateMyMentorProfile({
    bio: 'Expert en Data Science...',
    specialties: ['Python', 'ML'],
    availability: 'Lun-Ven 18h-20h'
});

// Avis d'un mentor
const reviews = await mentorService.getMentorReviews('123');
```

---

## 📅 Réservations (Bookings)

### Gérer les sessions mentor

```typescript
import { bookingService } from './services';

// Mes réservations
const bookings = await bookingService.getBookings({
    status: 'PENDING' // PENDING | CONFIRMED | REJECTED | COMPLETED | CANCELLED
});

// Créer une réservation
const booking = await bookingService.createBooking({
    mentor_id: '123',
    date: '2025-12-01',
    time: '18:00',
    domains: ['Python', 'Data Science'],
    expectations: 'Aide pour mon projet...',
    main_questions: 'Comment structurer mon code ?'
});

// Mettre à jour le statut (mentor uniquement)
await bookingService.updateBookingStatus('456', 'CONFIRMED', 'Je confirme notre session');

// Demandes reçues (mentors)
const requests = await bookingService.getMentorRequests();
```

---

## 🎯 Opportunités

### Bourses, stages, concours

```typescript
import { opportunityService } from './services';

// Liste des opportunités
const { count, results } = await opportunityService.getOpportunities({
    page: 1,
    type: 'SCHOLARSHIP', // SCHOLARSHIP | CONTEST | INTERNSHIP | TRAINING
    search: 'data'
});

// Détails d'une opportunité
const opportunity = await opportunityService.getOpportunity('123');
```

---

## 🔔 Notifications

### Gérer les notifications utilisateur

```typescript
import { notificationService } from './services';

// Toutes mes notifications
const notifications = await notificationService.getNotifications();

// Marquer comme lue
await notificationService.markAsRead('123');

// Marquer toutes comme lues
await notificationService.markAllAsRead();

// Supprimer une notification
await notificationService.deleteNotification('123');
```

---

## ⚙️ Configuration & Gestion des Erreurs

### Intercepteurs automatiques

Le client API gère automatiquement :
- ✅ Ajout du token JWT à chaque requête
- ✅ Rafraîchissement du token expiré
- ✅ Redirection vers /login si authentification échouée
- ✅ Gestion des erreurs réseau

### Exemple de gestion d'erreurs

```typescript
try {
    const questions = await forumService.getQuestions();
} catch (error: any) {
    if (error.response?.status === 401) {
        // Non authentifié
        console.error('Veuillez vous connecter');
    } else if (error.response?.status === 403) {
        // Accès refusé
        console.error('Vous n\'avez pas les permissions');
    } else if (error.response?.status === 404) {
        // Non trouvé
        console.error('Ressource introuvable');
    } else {
        // Autre erreur
        console.error('Erreur:', error.message);
    }
}
```

---

## 🌐 Endpoints Backend

### Base URL
```
http://127.0.0.1:8000/api/
```

### Endpoints disponibles

| Module | Méthode | Endpoint | Description |
|--------|---------|----------|-------------|
| **Auth** |
| | POST | `/auth/register/` | Inscription utilisateur |
| | POST | `/auth/login/` | Connexion utilisateur |
| | GET | `/auth/me/` | Utilisateur connecté |
| | PATCH | `/auth/profile/` | Mise à jour profil |
| **Forum** |
| | GET | `/forum/questions/` | Liste questions |
| | POST | `/forum/questions/` | Créer question |
| | GET | `/forum/questions/{id}/` | Détails question |
| | POST | `/forum/questions/{id}/vote/` | Voter |
| **Mentors** |
| | GET | `/mentors/` | Liste mentors |
| | GET | `/mentors/{id}/` | Profil mentor |
| | GET | `/mentors/my_profile/` | Mon profil (mentor) |
| | PATCH | `/mentors/my_profile/` | Modifier profil |
| **Bookings** |
| | GET | `/bookings/` | Mes réservations |
| | POST | `/bookings/` | Créer réservation |
| | PATCH | `/bookings/{id}/update_status/` | Changer statut |
| | GET | `/bookings/mentor_requests/` | Demandes reçues |
| **Opportunities** |
| | GET | `/opportunities/` | Liste opportunités |
| | GET | `/opportunities/{id}/` | Détails |
| **Notifications** |
| | GET | `/notifications/` | Mes notifications |
| | PATCH | `/notifications/{id}/mark_read/` | Marquer lue |
| | POST | `/notifications/mark_all_read/` | Tout marquer |
| | DELETE | `/notifications/{id}/` | Supprimer |

---

## 🧪 Tests Recommandés

### Scénario complet
1. ✅ Inscription d'un étudiant
2. ✅ Connexion
3. ✅ Consultation des questions
4. ✅ Création d'une question
5. ✅ Recherche de mentors
6. ✅ Réservation d'une session
7. ✅ Consultation des opportunités
8. ✅ Vérification des notifications

---

## 📚 Ressources

- **Documentation Swagger:** http://127.0.0.1:8000/api/docs/
- **Documentation ReDoc:** http://127.0.0.1:8000/api/redoc/
- **Schema OpenAPI:** http://127.0.0.1:8000/api/schema/

---

*Développé avec ❤️ par Marino ATOHOUN pour Hypee*
