# Résumé - Ajout de la Page Paramètres et Gestion des Rendez-vous

## Nouvelles Fonctionnalités

### 1. Page Paramètres (`/settings`)
- **Onglet Général**: Informations de profil (lecture seule pour l'instant), langue, fuseau horaire.
- **Onglet Rendez-vous**:
  - Liste des rendez-vous (passés et à venir).
  - Affichage détaillé (Mentor, Date, Heure, Statut, Lien visio).
  - Possibilité d'annuler un rendez-vous à venir.
  - Indicateurs visuels de statut (Confirmé, En attente, Annulé, etc.).
- **Onglet Sécurité**: Gestion du mot de passe et 2FA (placeholders).

### 2. Service de Réservations (`bookingsService`)
- Centralisation de la logique API pour les réservations.
- `getBookings()`: Récupérer les réservations de l'utilisateur (avec gestion de la pagination).
- `createBooking()`: Créer une nouvelle réservation.
- `cancelBooking()`: Annuler une réservation.
- `updateBookingStatus()`: Mettre à jour le statut (pour les mentors).
- `getMentorRequests()`: Récupérer les demandes reçues (pour les mentors).

### 3. Intégration Navigation
- Ajout du lien "Paramètres" dans le menu utilisateur (en haut à droite).
- Ajout du lien "Paramètres" dans le menu mobile.

## Modifications Techniques

### Backend
- Utilisation des endpoints existants dans `apps/bookings`.
- Aucune modification backend n'a été nécessaire (l'API supportait déjà tout).

### Frontend
- **Nouveau fichier**: `frontend/pages/Settings.tsx`
- **Nouveau fichier**: `frontend/services/bookings.ts`
- **Mise à jour**: `frontend/App.tsx` (ajout de la route).
- **Mise à jour**: `frontend/components/Layout.tsx` (ajout des liens).
- **Refactoring**: Remplacement de `bookingService` (singulier) par `bookingsService` (pluriel) dans tout le projet pour uniformiser.
- **Correction**: Adaptation de `getBookings` pour gérer la réponse paginée de Django REST Framework (`response.data.results`).

## Comment Tester

1. Connectez-vous en tant qu'étudiant.
2. Cliquez sur votre avatar en haut à droite -> "Paramètres".
3. Allez dans l'onglet "Rendez-vous".
4. Vous verrez la liste de vos sessions.
5. Si vous avez une session "En attente" ou "Confirmée", vous pouvez l'annuler.

## Prochaines Étapes Suggérées

- Implémenter la modification réelle du profil dans l'onglet "Général" (actuellement via `EditProfileModal` ailleurs).
- Ajouter la gestion réelle du mot de passe dans l'onglet "Sécurité".
- Intégrer Google Calendar ou autre pour les liens visio réels.
