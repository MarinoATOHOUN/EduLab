# Fonctionnalité de Chiffrement de Bout en Bout Automatisé (E2E)

## Vue d'ensemble
Le système de messagerie intègre désormais un chiffrement hybride RSA + AES de bout en bout, entièrement automatisé et transparent pour l'utilisateur, similaire à des applications comme WhatsApp ou Signal.

## Architecture Technique

### 1. Gestion des Clés (RSA-2048)
- **Génération**: À la première connexion, une paire de clés RSA (Publique/Privée) est générée localement dans le navigateur de l'utilisateur via `node-forge`.
- **Stockage Local**:
  - Clé Privée: Stockée dans `localStorage` (devrait être chiffrée par mot de passe utilisateur dans une version future).
  - Clé Publique: Stockée dans `localStorage`.
- **Distribution**: La clé publique est envoyée au serveur et stockée dans le profil utilisateur (`UserProfile.public_key`), la rendant accessible aux autres utilisateurs.

### 2. Processus d'Envoi (Chiffrement)
1. L'expéditeur génère une clé de session **AES-256** aléatoire pour le message.
2. Le contenu du message est chiffré avec cette clé AES.
3. La clé AES est chiffrée avec la **Clé Publique RSA** de chaque destinataire (et de l'expéditeur lui-même pour l'historique).
4. Le serveur reçoit:
   - Le contenu chiffré (AES).
   - Une map des clés AES chiffrées (`encrypted_keys: { userId: encryptedAesKey }`).

### 3. Processus de Réception (Déchiffrement)
1. Le destinataire récupère le message.
2. Il extrait la version chiffrée de la clé AES correspondant à son ID utilisateur.
3. Il déchiffre la clé AES avec sa **Clé Privée RSA** (stockée localement).
4. Il utilise la clé AES déchiffrée pour lire le contenu du message.

## Expérience Utilisateur
- **Transparence**: L'utilisateur n'a rien à configurer. Pas de mot de passe à échanger.
- **Indicateur**: Un petit cadenas vert 🔒 apparaît à côté des messages chiffrés.
- **Sécurité**: Le serveur ne voit jamais le contenu des messages ni les clés AES en clair.

## Limitations Actuelles
- **Persistance**: La clé privée est stockée dans le `localStorage`. Si l'utilisateur change de navigateur ou vide son cache, il perdra l'accès à ses anciens messages chiffrés (sauf si un mécanisme de sauvegarde/récupération de clé est implémenté).
- **Multi-device**: Actuellement, les clés sont liées à l'appareil. Une connexion sur un nouvel appareil générera de nouvelles clés, rendant les anciens messages illisibles sur ce nouvel appareil.
