# 🔑 Configuration de la Clé API Gemini

## Problème Actuel

L'erreur `500 Internal Server Error` sur `/api/ai/tutor/` indique que la clé API Gemini n'est pas valide ou mal configurée.

La clé actuelle dans votre `.env` (`gen-lang-client-0474647922`) ne semble pas être une vraie clé API Gemini.

## Comment Obtenir une Clé API Gemini Valide

### Étape 1 : Créer un Compte Google AI Studio

1. Allez sur **[Google AI Studio](https://aistudio.google.com/)**
2. Connectez-vous avec votre compte Google
3. Acceptez les conditions d'utilisation

### Étape 2 : Générer une Clé API

1. Dans Google AI Studio, cliquez sur **"Get API Key"** dans le menu de gauche
2. Cliquez sur **"Create API Key"**
3. Sélectionnez un projet Google Cloud (ou créez-en un nouveau)
4. Copiez la clé générée (elle commence généralement par `AIza...` et fait environ 39 caractères)

### Étape 3 : Configurer la Clé dans EduConnect

**Option A : Fichier `.env` (Recommandé)**

Ouvrez le fichier `/backend/.env` et modifiez la ligne 55 :

```env
# Remplacez cette ligne :
GEMINI_API_KEY=gen-lang-client-0474647922

# Par votre vraie clé :
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Option B : Variable d'Environnement**

```bash
export GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Étape 4 : Redémarrer le Serveur

Après avoir configuré la clé, **redémarrez le serveur Django** :

```bash
# Arrêtez le serveur (Ctrl+C dans le terminal)
# Puis relancez :
cd backend
python3 manage.py runserver
```

## Vérification

Une fois la clé configurée :

1. Allez sur la page **"Tutor AI"** du frontend
2. Posez une question simple (ex: "Bonjour")
3. Si tout fonctionne, vous devriez recevoir une réponse de Gemini

## Quota Gratuit

Google Gemini offre un quota gratuit généreux :
- **1500 requêtes par jour** (gratuit)
- **1 million de tokens par mois** (gratuit)

Parfait pour le développement et les tests !

## Dépannage

Si l'erreur persiste après avoir configuré une vraie clé :

1. Vérifiez que la clé est bien copiée (sans espaces)
2. Vérifiez que vous avez bien redémarré le serveur
3. Consultez les logs du serveur pour voir l'erreur détaillée
4. Assurez-vous que votre projet Google Cloud a l'API Gemini activée

---

**Développé par Marino ATOHOUN pour Hypee**
