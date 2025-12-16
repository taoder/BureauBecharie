# Guide de Déploiement

## Option 1 : Render.com (Recommandé - Gratuit)

Render.com est la solution la plus simple pour déployer votre application. C'est gratuit et prend moins de 5 minutes.

### Étape 1 : Préparer le Repository

1. **Pusher votre code sur GitHub** (si ce n'est pas déjà fait) :
   ```bash
   git add -A
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Étape 2 : Créer un Compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur "Get Started for Free"
3. Connectez-vous avec votre compte GitHub

### Étape 3 : Créer un Nouveau Service Web

1. Dans le dashboard Render, cliquez sur **"New +"** → **"Web Service"**

2. **Connectez votre repository GitHub** :
   - Donnez l'accès à votre repository `BureauBecharie`
   - Sélectionnez la branche `claude/coworking-space-scheduler-hSuow` ou `main`

3. **Configurez le service** :

   - **Name** : `coworking-scheduler` (ou ce que vous voulez)
   - **Region** : Choisissez le plus proche (Europe - Frankfurt)
   - **Branch** : `claude/coworking-space-scheduler-hSuow`
   - **Root Directory** : (laissez vide)
   - **Environment** : `Node`
   - **Build Command** :
     ```bash
     bash build.sh
     ```
   - **Start Command** :
     ```bash
     cd backend && npm start
     ```

4. **Plan** : Sélectionnez **"Free"** (0€/mois)

### Étape 4 : Configurer les Variables d'Environnement

Dans la section **"Environment Variables"**, ajoutez :

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = (cliquez sur "Generate" pour créer une clé aléatoire)
JWT_EXPIRATION = 7d
ADMIN_EMAIL = admin@coworking.local
ADMIN_PASSWORD = VotreMotDePasseSécurisé123!
ADMIN_NAME = Administrator
```

⚠️ **Important** : Changez `ADMIN_PASSWORD` par un mot de passe sécurisé !

### Étape 5 : Déployer !

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Installer les dépendances
   - Builder le frontend React
   - Démarrer le backend Node.js
   - Créer une URL publique

3. **Attendez 3-5 minutes** que le déploiement se termine

### Étape 6 : Accéder à Votre Application

Une fois le déploiement terminé, vous aurez une URL comme :

```
https://coworking-scheduler-xyz.onrender.com
```

Votre application est maintenant **EN LIGNE** ! 🎉

### Connexion Admin

Utilisez les identifiants configurés :
- **Email** : `admin@coworking.local`
- **Password** : celui que vous avez défini dans les variables d'environnement

---

## Option 2 : Railway.app (Alternative Gratuite)

Railway est une autre excellente option gratuite.

### Étapes Rapides :

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Project"** → **"Deploy from GitHub repo"**
4. Sélectionnez votre repository
5. Railway détecte automatiquement Node.js
6. Ajoutez les mêmes variables d'environnement
7. Déployez !

**Build Command** : `bash build.sh`
**Start Command** : `cd backend && npm start`

---

## Option 3 : Fly.io (Gratuit avec Carte Bancaire)

Fly.io est gratuit mais nécessite une carte bancaire pour vérification.

### Étapes :

1. Installez Fly CLI :
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Connexion :
   ```bash
   fly auth signup
   ```

3. Initialisez l'app :
   ```bash
   fly launch
   ```

4. Déployez :
   ```bash
   fly deploy
   ```

---

## Mises à Jour Automatiques

Avec Render ou Railway, chaque fois que vous poussez du code sur GitHub, votre application se redéploie automatiquement !

```bash
git add -A
git commit -m "Update feature"
git push origin main
```

→ L'application se met à jour automatiquement en 2-3 minutes !

---

## Base de Données SQLite en Production

⚠️ **Important** : SQLite fonctionne bien pour commencer, mais les données peuvent être perdues lors des redémarrages sur les services gratuits.

### Pour des Données Persistantes (Plus Tard) :

Si vous voulez des données persistantes, vous pouvez :

1. **Ajouter un disque persistant sur Render** :
   - Dans les paramètres, ajoutez un "Persistent Disk"
   - Montez-le sur `/data`
   - Modifiez le chemin de la base de données

2. **Migrer vers PostgreSQL** :
   - Render offre PostgreSQL gratuit
   - Railway offre PostgreSQL gratuit
   - Migration simple avec un ORM

---

## Troubleshooting

### L'application ne démarre pas

1. Vérifiez les logs dans le dashboard Render
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que `JWT_SECRET` est défini

### Erreur 503 ou "Service Unavailable"

- Attendez quelques minutes, le premier déploiement peut prendre du temps
- Le tier gratuit de Render s'endort après 15 minutes d'inactivité
- Le premier accès peut prendre 30-60 secondes pour réveiller l'app

### Les données disparaissent

- C'est normal avec SQLite sur le tier gratuit
- Ajoutez un disque persistant ou migrez vers PostgreSQL

---

## Coût

**Gratuit pour toujours** avec les limitations suivantes :
- Render Free : 750 heures/mois (suffisant pour 1 app)
- S'endort après 15 min d'inactivité
- Se réveille en ~30 secondes au premier accès
- Parfait pour un usage interne d'équipe

**Pour production sérieuse** :
- Render Starter : 7$/mois
- Railway Pro : 5$/mois
- → Application toujours active, plus rapide, données persistantes

---

## Prochaines Étapes

Une fois déployé, vous pouvez :

1. Partager l'URL avec votre équipe
2. Créer des utilisateurs depuis le panel admin
3. Commencer à réserver des bureaux !

**Besoin d'aide ?** Ouvrez un issue sur GitHub ou consultez la documentation de Render.
