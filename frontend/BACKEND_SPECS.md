# Spécifications Techniques Backend - EduConnect Africa
**Initiative Hypee (Bénin)**

Ce document décrit les modèles de données, les endpoints API et la logique métier nécessaires pour alimenter le frontend React d'EduConnect Africa. L'objectif est de fournir une API REST (via Django REST Framework recommandés) qui supporte toutes les fonctionnalités de la plateforme.

---

## 1. Authentification & Utilisateurs

### Modèles de Données
**User (CustomUser)**
*   `email` (Email, unique, identifiant de connexion)
*   `name` (Char, Nom complet)
*   `password` (Hash)
*   `role` (Enum: `STUDENT`, `MENTOR`, `ADMIN`)
*   `avatar` (Image/URL)
*   `country` (Char, ex: "Bénin", "Sénégal")
*   `university` (Char, Établissement)
*   `points` (Int, Gamification, default=0)
*   `created_at`, `updated_at`

### Endpoints
*   `POST /api/auth/register/` : Inscription (Payload: name, email, password, role).
*   `POST /api/auth/login/` : Connexion (Retourne: Token JWT + User Data).
*   `GET /api/auth/me/` : Récupérer le profil courant.
*   `PATCH /api/auth/profile/` : Mise à jour du profil standard (nom, avatar, pays, université).

---

## 2. Gestion des Mentors (Spécifique)

### Modèles de Données
**MentorProfile** (OneToOne avec User)
*   `bio` (Text)
*   `specialties` (JSON ou ManyToMany vers un modèle `Tag`).
*   `availability` (Text/JSON). *Note Frontend:* Actuellement stocké sous forme de string formatée (ex: "Lundi : 14h - 16h • Mardi..."), mais un format JSON structuré serait préférable côté DB.
*   `rating` (Float, Moyenne des notes)
*   `reviews_count` (Int)
*   `socials` (JSON: {linkedin, twitter, website})
*   `is_verified` (Bool, validation par l'admin).

### Logique Métier
*   Un utilisateur avec `role=MENTOR` doit avoir un `MentorProfile` associé.
*   Seuls les mentors peuvent mettre à jour leur `MentorProfile`.

### Endpoints
*   `GET /api/mentors/` : Liste des mentors.
    *   *Filtres requis:* `search` (nom/bio), `country`, `specialty`.
    *   *Tri:* `rating`, `reviews`.
*   `GET /api/mentors/{id}/` : Détail d'un mentor.
*   `PATCH /api/mentors/profile/` : Mise à jour des infos mentor (Bio, Disponibilités, Spécialités).

---

## 3. Système de Réservation (Booking)

### Modèles de Données
**Booking**
*   `student` (FK User)
*   `mentor` (FK User/MentorProfile)
*   `date` (Date)
*   `time` (Time)
*   `domains` (JSON/Array) : **Obligatoire**. Liste des domaines choisis (ex: ["Économie", "Gestion"]).
*   `expectations` (Text) : **Obligatoire**. Attentes de l'étudiant.
*   `main_question` (Text) : **Obligatoire**. Problématique principale.
*   `status` (Enum: `PENDING`, `CONFIRMED`, `REJECTED`, `COMPLETED`).

### Endpoints
*   `POST /api/bookings/` : Créer une demande de RDV.
    *   Payload: `mentor_id`, `date`, `time`, `domains` (array), `expectations`, `main_question`.
*   `GET /api/mentor/requests/` : (Côté Mentor) Liste des demandes reçues.
*   `PATCH /api/bookings/{id}/status/` : (Côté Mentor) Accepter/Refuser une demande.

---

## 4. Forum & Entraide (Questions)

### Modèles de Données
**Question**
*   `author` (FK User)
*   `title` (Char)
*   `content` (Text, support Markdown/HTML léger)
*   `tags` (JSON ou ManyToMany)
*   `votes` (Int)
*   `is_solved` (Bool)
*   `created_at`

**Answer**
*   `question` (FK Question)
*   `author` (FK User)
*   `content` (Text)
*   `is_accepted` (Bool, réponse validée par l'auteur)

### Endpoints
*   `GET /api/questions/` : Liste paginée. Filtres: `search`, `filter` (solved/unsolved).
*   `POST /api/questions/` : Créer une question.
*   `POST /api/questions/{id}/reply/` : Ajouter une réponse.
*   `POST /api/questions/{id}/vote/` : Upvote (ajoute des points à l'auteur).

---

## 5. Gamification (Badges & Points)

### Modèles de Données
**Badge**
*   `code` (slug, ex: 'b1', 'savant')
*   `name` (Char)
*   `description` (Text)
*   `icon` (Char/Emoji ou Image)
*   `color` (Char, classe CSS ou Hex)

**UserBadge**
*   `user` (FK User)
*   `badge` (FK Badge)
*   `awarded_at` (DateTime)

### Logique Métier (Backend Signals)
*   **Attribution de points :**
    *   Poser une question : +X points.
    *   Répondre : +Y points.
    *   Devenir Mentor : +Z points.
*   **Déblocage de badges :**
    *   Au passage de paliers de points (ex: 5000pts -> Badge Légende).
    *   À la première action (ex: Première question -> Badge Premier Pas).

### Endpoints
*   `GET /api/gamification/leaderboard/` : Top utilisateurs triés par points.
*   `GET /api/gamification/my-badges/` : Liste des badges de l'utilisateur courant.

---

## 6. Messagerie (Chat)

### Modèles de Données
**Conversation**
*   `participants` (ManyToMany User)
*   `last_message_at` (DateTime)

**Message**
*   `conversation` (FK Conversation)
*   `sender` (FK User)
*   `content` (Text)
*   `timestamp` (DateTime)
*   `is_read` (Bool)

### Endpoints
*   `GET /api/conversations/` : Liste des conversations (avec unread_count).
*   `GET /api/conversations/{id}/messages/` : Historique des messages.
*   `POST /api/conversations/{id}/messages/` : Envoyer un message.
*   *Note:* Idéalement géré via **WebSockets** (Django Channels) pour le temps réel, sinon Polling sur les endpoints GET.

---

## 7. Opportunités

### Modèles de Données
**Opportunity**
*   `title` (Char)
*   `provider` (Char, ex: "Google", "Union Africaine")
*   `type` (Enum: `SCHOLARSHIP`, `CONTEST`, `INTERNSHIP`, `TRAINING`)
*   `deadline` (Date)
*   `description` (Text)
*   `location` (Char)
*   `image` (URL)
*   `external_link` (URL)

### Endpoints
*   `GET /api/opportunities/` : Liste. Filtre par `type`.

---

## 8. Notifications

### Modèles de Données
**Notification**
*   `user` (FK User)
*   `title` (Char)
*   `message` (Text)
*   `type` (Enum: `SYSTEM`, `REPLY`, `MENTORSHIP`, `ACHIEVEMENT`)
*   `link` (Char, URL interne de redirection)
*   `is_read` (Bool)
*   `created_at`

### Endpoints
*   `GET /api/notifications/` : Liste des notifs de l'utilisateur.
*   `POST /api/notifications/mark-read/` : Marquer tout ou une notif comme lue.
*   `DELETE /api/notifications/{id}/` : Supprimer.

---

## 9. Outils & IA (Proxy)

### Tuteur IA
Le frontend communique actuellement avec un service (`GeminiService`).
*   **Option A (Client-side) :** Le frontend garde la clé API (risqué en prod).
*   **Option B (Proxy Backend - Recommandé) :**
    *   Endpoint : `POST /api/ai/tutor/`
    *   Payload : `{ "question": "...", "subject": "Maths", "level": "Lycée" }`
    *   Le backend interroge l'API Gemini/OpenAI et renvoie la réponse.

### Outils (Calculatrice, Sandbox, Atlas)
Ces outils sont principalement "Client-Side". Aucune persistance n'est requise pour l'instant (sauf si on veut sauvegarder les codes du Sandbox, alors créer un modèle `CodeSnippet`).

---

## Résumé des Règles Métier Hypee
1.  **Approche Pratique :** Les contenus et descriptions doivent encourager le passage à la pratique.
2.  **Accessibilité :** Les API doivent être légères (pagination, compression) pour les connexions internet africaines parfois limitées.
3.  **Localisation :** Les données (Atlas, Mentors) sont focalisées sur le continent africain.
