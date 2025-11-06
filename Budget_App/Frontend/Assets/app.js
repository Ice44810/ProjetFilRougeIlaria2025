console.log("BudgetApp frontend chargé");

// Exemple de requête API :
fetch("")
  .then(res => res.json())
  .then(data => console.log("Données récupérées :", data));
  .catch (err => console.error("Erreur API :", err));


