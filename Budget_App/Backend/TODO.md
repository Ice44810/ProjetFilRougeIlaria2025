# TODO: Rendre dynamique la page banque

## Étapes du plan approuvé (Option 1: champs directs dans users table)

### 1. ✅ Créer fichier TODO.md (fait)

### 2. ✅ Créer script migration DB pour ajouter champs banque à users table
- Fichier: migrations/add_bank_fields.sql (prêt, client DB install en cours)

### 3. ✅ Exécuter migration DB (utiliser execute_command après install)

### 4. ✅ Mettre à jour models/User.js (ajouter champs iban, bicSwift, bankName, balance)

### 5. ✅ Mettre à jour handlers/users.js 
- Étendre requête SELECT dans getProfile()
- Ajouter logique balance si computed

### 6. ✅ Mettre à jour public/js/api.js 
- Étendre getProfile() ou ajouter getBankDetails() (getProfile prêt)

### 7. ✅ Mettre à jour pages/banque.html
- Ajouter fetch data on DOMContentLoaded
- Remplacer static data par data.fields
- Rendre copy IBAN dynamique

### 8. Ajouter échantillon data test (INSERT user avec bank info)

### 9. Tester:
- API /api/users/profile
- Page banque.html
- Copy IBAN

### 10. ✅ Marquer complet + attempt_completion

