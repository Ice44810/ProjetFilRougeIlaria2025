# Exemple de test unitaire très simple
from app import app

def test_get_transactions():
    client = app.test_client()
    response = client.get("/api/transactions")
    assert response.status_code == 200
