<?php
// enregistrer_carte.php

// 1. Connexion à la base de données
$db = new PDO('mysql:host=localhost;dbname=votre_bdd', 'user', 'password');

// 2. Récupération des données JSON envoyées par JavaScript
$json = file_get_contents('php://input');
$data = json_decode($json);

if ($data) {
    // 3. Préparation de la requête (Sécurité contre les injections SQL)
    $query = $db->prepare("INSERT INTO cartes (numero, titulaire, expiration, cvv) VALUES (?, ?, ?, ?)");
    $result = $query->execute([
        $data->cardNumber,
        $data->cardHolder,
        $data->expiryDate,
        $data->cvv
    ]);

    echo json_encode(['success' => $result]);
}

?>