from flask import Blueprint, jsonify

api = Blueprint("api", __name__)

@api.route("/transactions", methods=["GET"])
def get_transactions():
    """Retourne la liste des transactions (exemple statique)."""
    transactions = [
        {"id": 1, "type": "revenu", "montant": 2000, "categorie": "Salaire"},
        {"id": 2, "type": "dépense", "montant": 150, "categorie": "Courses"},
    ]
    return jsonify(transactions)
