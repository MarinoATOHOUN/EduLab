# 💬 Système de Messagerie - Documentation Technique

**Développé par Marino ATOHOUN pour Hypee**

---

## ✅ État du Système

| Fonctionnalité | Statut | Détails |
|----------------|--------|---------|
| **API Backend** | ✅ Prêt | CRUD Conversations, Messages, Pièces jointes |
| **Frontend UI** | ✅ Prêt | Interface Chat complète, Responsive |
| **Temps Réel** | ✅ Prêt | WebSockets via Django Channels |
| **Fichiers** | ⚠️ Partiel | Simulation (Data URL). Nécessite S3 pour prod. |
| **Notifications** | ⏳ En cours | Backend prêt, Frontend à connecter |

---

## 🔄 Flux de Données Temps Réel

1.  **Connexion**
    - Le client initie une connexion WebSocket : `ws://host:8000/ws/chat/{id}/?token={access_token}`
    - `JwtAuthMiddleware` valide le token et identifie l'utilisateur.
    - `ChatConsumer` ajoute l'utilisateur au groupe `chat_{id}`.

2.  **Envoi de Message**
    - Le client fait un `POST` sur l'API `/api/conversations/{id}/send_message/`.
    - `ConversationViewSet` sauvegarde le message en base de données.
    - `ConversationViewSet` envoie un signal au groupe Channels.
    - `ChatConsumer` diffuse le message à tous les clients connectés via WebSocket.

3.  **Réception**
    - Le client reçoit l'événement `chat_message`.
    - React met à jour le state `messages` et `conversations`.

---

## 🛠 Configuration Technique

### Backend
- **Channels Layer** : `InMemoryChannelLayer` (Développement) / Redis (Production)
- **Auth** : Custom JWT Middleware (Query Param)
- **Routing** : `ws/chat/<conversation_id>/`

### Frontend
- **Service** : `messagingService.connectToChat()`
- **Gestion** : `useEffect` dans `Chat.tsx` gère le cycle de vie de la connexion.
- **Doublons** : Vérification des IDs pour éviter d'afficher deux fois le même message (API response + WS event).

---

## ⚠️ Notes Importantes

1.  **Redémarrage Serveur** : Après modification des fichiers Python (surtout `asgi.py` et `settings.py`), le serveur de développement Django redémarre automatiquement, mais il peut être nécessaire de le relancer manuellement si les WebSockets ne connectent pas.
2.  **Redis** : Pour passer en production, décommenter la configuration Redis dans `settings.py` et installer un serveur Redis.
3.  **HTTPS** : En production, assurez-vous d'utiliser `wss://` (géré automatiquement par le service frontend).

---

**Développé avec ❤️ par l'équipe Hypee**
