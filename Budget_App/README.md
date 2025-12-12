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
m	Définit le type de propriété : Marge (margin).
b	Définit la direction : Bas (bottom).
3	Définit la taille ou le niveau d'espacement.

**Le sélecteur de classe: `<button class="btn btn-danger w-100">Book Now</button>` utilise **trois classes Bootstrap** essentielles pour styliser le bouton.
1.  Stylisé comme un bouton standard de Bootstrap (`btn`).
2.  De couleur **rouge vif** (`btn-danger`).
3.  Étendu sur toute la **largeur** de son conteneur (`w-100`).

## REMARQUE IMPORTANTE:
 Le numéro de carte (fullCardNumber) doit être chargé dynamiquement 
 depuis votre serveur de manière sécurisée. Ne JAMAIS le laisser
 en clair dans le code HTML ou JavaScript pour une application réelle.

 ** Données Mysql 
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
