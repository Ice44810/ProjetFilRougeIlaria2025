console.log("BudgetApp frontend chargé ✅");

// Exemple de requête API :
fetch("http://127.0.0.1:5000/api/transactions")
  .then(res => res.json())
  .then(data => console.log("Transactions:", data))
  .catch(err => console.error("Erreur API:", err));
