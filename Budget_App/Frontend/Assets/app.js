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
        // Variable pour stocker le numéro de carte complet (à remplacer par la donnée réelle de l'utilisateur)
const fullCardNumber = "4567 1234 9876 2458"; 
const maskedCardNumber = "**** **** **** 2458";

const cardNumberElement = document.getElementById('cardNumber');
const toggleIcon = document.getElementById('toggleCardNumber');

// État initial : le numéro est masqué
let isMasked = true; 
toggleIcon.addEventListener('click', () => {
    if (isMasked) {
        // Si le numéro est masqué, on affiche le numéro complet
        cardNumberElement.textContent = fullCardNumber;
        // On change l'icône pour indiquer qu'on peut masquer à nouveau
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
        isMasked = false;
    } else {
        // Sinon (si le numéro est visible), on affiche le numéro masqué
        cardNumberElement.textContent = maskedCardNumber;
        // On remet l'icône 'bi-eye'
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
        isMasked = true;
    }
});
