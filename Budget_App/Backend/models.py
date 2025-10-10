# Exemple de modèle SQLAlchemy (à compléter)
from sqlalchemy import Table, Column, Integer, String, Float, MetaData

metadata = MetaData()

transactions = Table(
    "transactions",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("type", String),
    Column("montant", Float),
    Column("categorie", String)
)
