<?php
header("Content-Type: application/json");
require_once "db.php"; // Fichier de connexion à la base de données

// Vérifier que toutes les données existent
if (// requete POST du formulaire
    isset($_POST['fullName']) &&
    isset($_POST['email']) &&
    isset($_POST['phone']) &&
    isset($_POST['address']) &&
    isset($_POST['postcode']) &&
    isset($_POST['ville']) &&
    isset($_POST['user_id']) // ID de l'utilisateur connecté
) {
    $fullName = $_POST['fullName'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $postcode = $_POST['postcode'];
    $ville = $_POST['ville'];
    $userId = $_POST['user_id'];

    try { // Mise à jour du profil
        $sql = "UPDATE users SET 
                fullName = :fullName,
                email = :email,
                phone = :phone,
                address = :address,
                postcode = :postcode,
                ville = :ville
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([ // Paramètres de la requête
            ":fullName" => $fullName,
            ":email" => $email,
            ":phone" => $phone,
            ":address" => $address,
            ":postcode" => $postcode,
            ":ville" => $ville,
            ":id" => $userId
        ]);
        // Résultat de la mise à jour
        echo json_encode(["status" => "success", "message" => "Profil mis à jour"]);
    } catch (Exception $e) { // Si une erreur survient
        echo json_encode(["status" => "error", "message" => "Erreur : " . $e->getMessage()]);
    }
} else { // Si les données sont manquantes
    echo json_encode(["status" => "error", "message" => "Champs manquants"]);
}
