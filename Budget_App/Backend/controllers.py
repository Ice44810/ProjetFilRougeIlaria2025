# Fichier pour la logique métier (ex: calcul total dépenses/revenus)
def calculer_solde(transactions):
    solde = 0
    for t in transactions:
        if t["type"] == "revenu":
            solde += t["montant"]
        else:
            solde -= t["montant"]
    return solde
