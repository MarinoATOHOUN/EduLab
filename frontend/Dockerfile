# Utiliser une image Node.js légère
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port par défaut de Vite
EXPOSE 3000

# Lancer l'application en mode développement
CMD ["npm", "run", "dev", "--", "--host"]
