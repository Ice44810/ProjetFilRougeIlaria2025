## Notes fonctionnelles - BudgetApp

## Objectifs

- Suivre les dépenses et revenus
- Catégoriser les transactions
- Générer un résumé du budget

## Fonctionnalités à implémenter

1. Ajouter / modifier / supprimer une transaction
2. Catégories personnalisées
3. Graphiques de suivi (revenus vs dépenses)
4. Historique mensuel

Partie signification des variable css boostrap
Mb3 :
m Définit le type de propriété : Marge (margin).
b Définit la direction : Bas (bottom).
3 Définit la taille ou le niveau d'espacement.

**Le sélecteur de classe: `<button class="btn btn-danger w-100">Book Now</button>` utilise **trois classes Bootstrap\*\* essentielles pour styliser le bouton.

1.  Stylisé comme un bouton standard de Bootstrap (`btn`).
2.  De couleur **rouge vif** (`btn-danger`).
3.  Étendu sur toute la **largeur** de son conteneur (`w-100`).

## REMARQUE IMPORTANTE:

Le numéro de carte (fullCardNumber) doit être chargé dynamiquement
depuis le serveur de manière sécurisée. Ne JAMAIS le laisser
en clair dans le code HTML ou JavaScript pour une application réelle.

\*\* Données Mysql
allTransactions = {
id: 1,
date: '2025-09-12',
description: 'Électricité',
category: 'Factures',
source: 'Prélèvement',
amount: -75.00,
type: 'debit',
icon: 'lightning-charge',
color: 'text-info'
},
{
id: 2,
date: '2025-09-10',
description: 'Achat Livres',
category: 'Dépenses',
source: 'Paiement carte',
amount: -22.50,
type: 'debit',
icon: 'book',
color: 'text-danger'
},
{
id: 3,
date: '2025-09-05',
description: 'Facture Eau',
category: 'Factures',
source: 'Paiement en ligne',
amount: -45.99,
type: 'debit',
icon: 'droplet',
color: 'text-info'
},
{
id: 4,
date: '2025-09-02',
description: 'Courses Supermarché',
category: 'Dépenses',
source: 'Paiement carte',
amount: -85.30,
type: 'debit',
icon: 'cart',
color: 'text-warning'
},
{
id: 5,
date: '2025-09-01',
description: 'Salaire Mensuel',
category: 'Revenus',
source: 'Virement bancaire',
amount: 3500.00,
type: 'credit',
icon: 'bank2',
color: 'text-success'
},
{
id: 6,
date: '2025-08-28',
description: 'Abonnement Cinéma',
category: 'Dépenses',
source: 'Prélèvement automatique',
amount: -15.00,
type: 'debit',
icon: 'film',
color: 'text-danger'
},
{
id: 7,
date: '2025-08-15',
description: 'Remboursement Amis',
category: 'Revenus',
source: 'Virement',
amount: 50.00,
type: 'credit',
icon: 'person-fill',
color: 'text-success'
},

1. Structure BackEnd du projet :

/mon-app-alipay
├── /assets (Images, CSS, JS)
├── /includes (Logique partagée : db.php, fonctions.php)
├── /templates (Bouts de code HTML : header.php, footer.php)
├── /actions (Scripts PHP de traitement : login_action.php, transfer_process.php)
├── index.php (Point d'entrée / Home)
├── login.php
├── profile.php
└── ...

2. Utiliser le système de "Templates"
   Au lieu de répéter le code du menu ou du head sur chaque page, sépare-les.

Exemple dans home.php :

<?php 
require_once 'includes/db.php'; // Connexion BDD
require_once 'includes/auth_check.php'; // Vérifie si l'user est connecté

include 'templates/header.php'; // Contient le <head> et le début du body
?>

<main class="container">
    <h1>Bienvenue, <?= $_SESSION['user_name'] ?></h1>
    </main>
<?php include 'templates/footer.php'; // Contient les scripts JS et la fin du body ?>

3. Organisation logique par fonctionnalités
   Vu tes pages, tu as 4 grands pôles. Je te conseille de regrouper tes scripts de traitement (actions/) ainsi :
   Pôle Pages concernées Logique Backend à prévoir

Authentification login.html, register.html Sessions PHP, hachage
de mots passe, vérification email.
Transactions transfert.html, topup.html, Requêtes SQL INSERT (transactions),
bankhistory.html calcul de solde, vérification des fonds.
Gestion Contacts mycontact.html, newrecipient.html, CRUD (Create, Read, Update, Delete)
detailcontact.html sur la table contacts.
Profil & Cartes profile.html, cardinfo.html, Mise à jour des données user,
setting.html gestion des états des cartes.

4. Passer du .html au .php dynamique
   Pour que tes liens fonctionnent avec ta base de données, change tes extensions.
   Dans ton menu : Remplace <a href="profile.html"> par <a href="profile.php">.

Pour les détails : N'utilise pas une page par contact. Utilise une variable GET.
Lien : detailcontact.php?id=45
Backend : $id = $\_GET['id']; // On récupère l'ID pour afficher le bon contact via SQL.

5. Sécurité de base (Indispensable)
   Puisque tu gères des transferts et de l'argent (même fictif) :

Sessions : Commence chaque page protégée par session_start(). Si $\_SESSION['user_id'] n'existe pas, redirige vers login.php.

Requêtes préparées : N'insère jamais de variables directement dans tes requêtes SQL pour éviter les injections.

Mauvais : "SELECT \* FROM users WHERE id = $id"

Bon : Utilise PDO avec des marqueurs ?.

Validation : Pour tes pages de transfert, vérifie toujours côté serveur que le montant est positif et que l'utilisateur possède bien la somme avant de valider.

        Organisation des fichiers pour la configuration :

- Section LOGIN VIA PHP

1. Le fichier de configuration : includes/db.php
   Ce fichier sera inclus au début de chaque page qui a besoin d'accéder aux données (profil, historique, transferts).

2. Organisation de la Base de Données (SQL)
   Pour tes pages, voici une structure de tables cohérente à créer dans ton outil (comme phpMyAdmin) :
   users : id, nom, email, password, solde (balance).

contacts : id, user_id (le propriétaire), contact_name, account_number, email.

transactions : id, sender_id, receiver_id, amount, type (transfer/topup), date.

3. Exemple : Comment utiliser ce fichier dans profile.php
   Maintenant que db.php est prêt, voici comment tu récupères les infos de l'utilisateur connecté : voir le (profil.php)

Pourquoi faire comme ça ?
Sécurité : Les "requêtes préparées" (prepare + execute) empêchent les pirates d'injecter du code dans tes formulaires.

Maintenance : Si tu changes de mot de passe de base de données, tu n'as qu'un seul fichier à modifier (db.php).

Lisibilité : Ton code HTML reste propre et ton code PHP est bien rangé.

4. La sécurité : includes/auth_check.php
   Pour empêcher quelqu'un d'accéder à profile.php ou transfert.php simplement en tapant l'URL, fichier à inclure en haut des pages protégées : <?php
   session_start();
   if (!isset($\_SESSION['user_id'])) {
   // Si l'utilisateur n'est pas connecté, retour au login
   header("Location: login.php");
   exit();
   }
   ?>

5. Le script de traitement : actions/register_action.php
   Ce script va vérifier si l'email existe déjà, hacher le mot de passe, et insérer l'utilisateur avec un solde initial de 0 €.

6. Pourquoi c'est important ?
   password_hash() : Même si un pirate accède à ta base de données, il ne pourra pas lire les mots de passe des utilisateurs. Ils ressembleront à une suite de caractères illisibles comme $2y$10$vI8....

filter_var & htmlspecialchars : Ces fonctions protègent ton site contre les attaques de type XSS (injection de scripts malveillants dans tes pages).

lastInsertId() : Cette fonction de PDO récupère l'ID qui vient d'être généré automatiquement par MySQL, ce qui permet de créer la session tout de suite.

4. Rappel sur ta base de données
   Pour que ce code fonctionne, ta table users doit ressembler à ceci :

id : INT, Auto Increment, Primary Key.
nom : VARCHAR(100).
email : VARCHAR(150), Unique.
password : VARCHAR(255).
balance : DECIMAL(10,2), Default 0.00.
