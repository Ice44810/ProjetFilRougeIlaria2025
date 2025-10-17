console.log("BudgetApp frontend chargé");

// Exemple de requête API :
fetch("")
  .then(res => res.json())
  .then(data => console.log("Données récupérées :", data));
  .catch (err => console.error("Erreur API :", err));
  
// Remplissage automatique du modal avec les infos du contact cliqué
  const contactModal = document.getElementById('contactModal');
        contactModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;
            const name = button.getAttribute('data-name');
            const number = button.getAttribute('data-number');
            const email = button.getAttribute('data-email');
            const img = button.querySelector('img').src;

            document.getElementById('contactName').textContent = name;
            document.getElementById('contactNumber').textContent = number;
            document.getElementById('contactEmail').textContent = email;
            document.getElementById('contactImage').src = img; 
        });