// Sélection des éléments
const profilForm = document.getElementById("profilForm");
const = document.getElementById("img");
const avatarPreview = document.getElementById("avatarPreview");

// Ouvrir la fenêtre d’upload en cliquant la photo
avatarPreview.addEventListener("click", () => avatarInput.click());

// Prévisualisation immédiate
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => (avatarPreview.src = reader.result);
  reader.readAsDataURL(file);

  localStorage.setItem("avatar", reader.result); // Stockage local
});

// Charger le profil existant
document.addEventListener("DOMContentLoaded", () => {
  const saved = JSON.parse(localStorage.getItem("profil"));
  const avatar = localStorage.getItem("avatar");

  if (avatar) avatarPreview.src = avatar;

  if (saved) {
    for (const key in saved) {
      const input = document.getElementById(key);
      if (input) input.value = saved[key];
    }
  }
});

// Soumission du formulaire
profilForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    fullName: fullName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    tva: tva.value.trim(),
    address: address.value.trim(),
    postcode: postcode.value.trim(),
    city: city.value.trim(),
  };

  // Validation basique
  for (const k in data) {
    if (!data[k]) {
      alert("Tous les champs doivent être remplis.");
      return;
    }
  }

  // Mot de passe
  if (newPassword.value || confirmPassword.value) {
    if (newPassword.value !== confirmPassword.value) {
      alert("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.value.length < 6) {
      alert("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    // (dans le futur : appel API PUT /api/users/update-password)
    console.log("🔐 Nouveau mot de passe enregistré.");
  }

  // Sauvegarde locale
  localStorage.setItem("profil", JSON.stringify(data));

  alert("✅ Profil mis à jour !");

  // Redirection après 1 seconde
  setTimeout(() => (window.location.href = "index.html"), 1000);
});
