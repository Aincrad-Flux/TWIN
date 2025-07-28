FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY src/ ./src/

# Créer le dossier logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 3000

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S twin -u 1001
USER twin

# Démarrer l'application
CMD ["npm", "start"]