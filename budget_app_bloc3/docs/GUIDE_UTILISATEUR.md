# Guide Utilisateur - Budget App

## Table des Matières

1. [Introduction](#introduction)
2. [Premiers Pas](#premiers-pas)
3. [Gestion du Profil](#gestion-du-profil)
4. [Transactions](#transactions)
5. [Catégories](#catégories)
6. [Statistiques et Graphiques](#statistiques-et-graphiques)
7. [FAQ](#faq)

---

## Introduction

**Budget App** est une application de gestion de budget personnel qui vous permet de :

- 📊 Suivre vos revenus et dépenses
- 🏷️ Catégoriser vos transactions
- 📈 Visualiser des statistiques détaillées
- 💰 Connaître votre solde actuel

---

## Premiers Pas

### 1. Inscription

Pour créer un compte :

1. Lancez l'application
2. Cliquez sur **"S'inscrire"** ou **"Register"**
3. Remplissez le formulaire :
   - **Nom** : Votre nom complet
   - **Email** : Votre adresse email (doit être unique)
   - **Mot de passe** : Minimum 8 caractères
   - **Confirmation** : Répétez le mot de passe
4. Cliquez sur **"Créer un compte"**

> ✅ Un token d'authentification vous sera attribué automatiquement après l'inscription.

### 2. Connexion

1. Cliquez sur **"Connexion"** ou **"Login"**
2. Entrez votre email et mot de passe
3. Cliquez sur **"Se connecter"**

> ⚠️ **Important** : Conservez votre token d'authentification en sécurité. Il vous sera demandé pour chaque requête API.

---

## Gestion du Profil

### Modifier mes informations

Pour mettre à jour votre profil :

```
PUT /api/auth/profile
```

**Corps de la requête :**
```json
{
  "name": "Nouveau nom",
  "email": "nouveau@email.com"
}
```

### Changer mon mot de passe

```
PUT /api/auth/password
```

**Corps de la requête :**
```json
{
  "current_password": "ancien_mot_de_passe",
  "password": "nouveau_mot_de_passe",
  "password_confirmation": "nouveau_mot_de_passe"
}
```

### Voir mon profil

```
GET /api/auth/me
```

---

## Transactions

Les transactions représentent vos mouvements financiers (revenus et dépenses).

### Créer une transaction

```
POST /api/transactions
```

**Corps de la requête :**
```json
{
  "title": "Courses hebdomadaires",
  "amount": 150.00,
  "type": "expense",
  "category_id": 7,
  "description": "Courses pour la semaine",
  "date": "2025-01-20"
}
```

**Types de transactions :**
- `income` : Revenu (salaire, cadeau, etc.)
- `expense` : Dépense (courses, factures, etc.)

### Voir mes transactions

```
GET /api/transactions
```

**Filtres disponibles :**

| Paramètre | Valeurs possibles | Description |
|-----------|-------------------|-------------|
| `type` | `income`, `expense` | Filtrer par type |
| `category_id` | ID de la catégorie | Filtrer par catégorie |
| `period` | `today`, `week`, `month`, `year` | Filtrer par période |
| `per_page` | Nombre | Nombre de résultats par page |

**Exemples :**

```bash
# Transactions du mois en cours
GET /api/transactions?period=month

# Seulement les dépenses
GET /api/transactions?type=expense

# Transactions d'une catégorie spécifique
GET /api/transactions?category_id=7
```

### Modifier une transaction

```
PUT /api/transactions/{id}
```

### Supprimer une transaction

```
DELETE /api/transactions/{id}
```

### Transactions récentes (page d'accueil)

```
GET /api/transactions/recent?limit=5
```

### Mon solde actuel

```
GET /api/transactions/balance
```

**Réponse :**
```json
{
  "balance": "3250.00",
  "total_income": "7000.00",
  "total_expense": "3750.00",
  "currency": "€"
}
```

---

## Catégories

Les catégories permettent d'organiser vos transactions.

### Types de catégories

- **Catégories globales** : Disponibles pour tous les utilisateurs (ex: Alimentation, Transport)
- **Catégories personnalisées** : Créées par vous pour un usage personnel

### Liste des catégories

```
GET /api/categories
```

### Catégories par type

```
GET /api/categories/type/expense
GET /api/categories/type/income
```

### Créer une catégorie personnalisée

```
POST /api/categories
```

**Corps de la requête :**
```json
{
  "name": "Mon categoría",
  "type": "expense",
  "icon": "bi-emoji-smile"
}
```

### Icônes disponibles

L'application utilise les **Bootstrap Icons**. Quelques exemples :

| Icône | Code |
|-------|------|
| 🛒 Courses | `bi-cart` |
| 🚗 Transport | `bi-car` |
| 🏠 Logement | `bi-house` |
| 💼 Salaire | `bi-briefcase` |
| 🎮 Loisirs | `bi-controller` |
| 🏥 Santé | `bi-heart-pulse` |
| 📚 Éducation | `bi-book` |
| 🎁 Cadeaux | `bi-gift` |

---

## Statistiques et Graphiques

### Statistiques générales

```
GET /api/stats
```

**Réponse :**
```json
{
  "balance": "3250.00",
  "total_income": "7000.00",
  "total_expense": "3750.00",
  "transaction_count": 15,
  "currency": "€"
}
```

### Statistiques par catégorie

```
GET /api/stats/categories?type=expense&period=month
```

### Évolution mensuelle

```
GET /api/stats/monthly?months=6
```

### Données pour graphique camembert

```
GET /api/stats/pie?type=expense&period=month
```

### Données pour graphique linéaire

```
GET /api/stats/line?months=12
```

### Page d'accueil

```
GET /api/home
```

**Résultat :** Affiche le solde, les récompenses et les dernières transactions.

---

## FAQ

### Comment fonctionne l'authentification ?

L'application utilise des **tokens API** (Laravel Sanctum). Après connexion, un token vous est attribué. Vous devez l'inclure dans chaque requête :

```
Authorization: Bearer <votre_token>
```

### Comment récupérer mon token ?

Le token vous est envoyé lors de :
- L'inscription (`POST /api/auth/register`)
- La connexion (`POST /api/auth/login`)

### Que faire si j'oublie mon mot de passe ?

Contactez l'administrateur ou créez un nouveau compte.

### Comment sont calculées les statistiques ?

Les statistiques sont calculées en temps réel à partir de vos transactions :
- **Solde** = Total des revenus - Total des dépenses
- **Stats par catégorie** = Somme des transactions par catégorie
- **Évolution mensuelle** = Comparaison mois par mois

### Puis-je supprimer une catégorie globale ?

Non, les catégories globales (créées par l'administrateur) ne peuvent pas être supprimées. Vous pouvez uniquement créer et supprimer vos propres catégories.

---

## Support

Pour toute question ou problème :

- 📧 Email : support@budgetapp.fr
- 📖 Documentation technique : Voir `DOCS.md`
- 🐛 Signaler un bug : Via le panneau de configuration

---

**Merci d'utiliser Budget App !** 🎉

*Version de l'application : 1.0.0*  
*Dernière mise à jour : Janvier 2025*

