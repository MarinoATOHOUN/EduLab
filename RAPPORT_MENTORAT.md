# Rapport d'Implémentation : Candidature Mentor

## Objectifs

1. Améliorer le formulaire "Devenir Mentor" au frontend.
2. Structurer les données de disponibilité.
3. Ajouter l'upload de CV (PDF uniquement).
4. Ajouter une note informative sur le processus de validation.
5. Assurer l'enregistrement des données au backend.

## Modifications Effectuées

### Backend (Django)

- **Modèle `MentorApplication`** (`apps/mentors/models.py`) :
  - Créé pour stocker les candidatures séparément des profils mentors actifs.
  - Champs : `user`, `cv_file`, `status` (PENDING, APPROVED, REJECTED), `bio`, `university`, `specialties` (JSON), `availability` (JSON), `linkedin`, `twitter`, `website`.
- **Migration** : `0003_mentorapplication` créée et appliquée.
- **Serializer** (`apps/mentors/serializers.py`) :
  - `MentorApplicationSerializer` ajouté.
  - Validation stricte du fichier CV : extension `.pdf` et taille max 5 Mo.
- **Vue** (`apps/mentors/views.py`) :
  - Action `apply` ajoutée au `MentorViewSet`.
  - Vérifie si l'utilisateur a déjà une demande en cours.
  - Gère l'upload de fichier via `MultiPartParser`.

### Frontend (React)

- **Service** (`services/mentors.ts`) :
  - Méthode `apply` ajoutée pour envoyer les données via `FormData`.
- **Composant `BecomeMentorModal`** (`components/BecomeMentorModal.tsx`) :
  - **Note informative** : Ajoutée en haut du formulaire (délai de 2 jours).
  - **Disponibilités** : Interface dynamique pour ajouter plusieurs créneaux (Jour + Heure début + Heure fin).
  - **CV Upload** : Zone de drag & drop (simulée) pour uploader un PDF. Validation côté client (type et taille).
  - **Logique** : Construction du `FormData` avec sérialisation JSON pour les tableaux (`specialties`, `availability`).

## Tests Réalisés

- **Visuel** : Vérification de l'affichage du formulaire, de la note et des nouveaux champs sur `http://localhost:3000`.
- **Validation Client** : Le formulaire empêche la soumission si le CV est manquant ou si aucune disponibilité n'est ajoutée.
- **Backend** : Le serveur a redémarré correctement avec les nouveaux modèles et endpoints.
- **Validation API** : Test réussi via script Python.
  - Authentification OK.
  - Soumission `POST /api/mentors/apply/` OK (Status 201).
  - Enregistrement en base de données OK (Modèle `MentorApplication`).
  - Upload de fichier PDF OK.
  - Gestion des doublons OK (Erreur 400 si demande déjà existante).

## Prochaines Étapes pour l'Utilisateur

1. Se connecter sur l'application.
2. Aller dans "Mentors" -> "Devenir Mentor".
3. Remplir le formulaire, ajouter des disponibilités et uploader un vrai fichier PDF.
4. Valider et vérifier que la demande est bien enregistrée (message de succès).
