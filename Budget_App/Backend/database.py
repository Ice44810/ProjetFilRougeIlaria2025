from sqlalchemy import create_engine, MetaData

engine = create_engine("sqlite:///../data/budget.db", echo=False)
metadata = MetaData()

def init_db():
    """Crée la base de données si elle n'existe pas."""
    metadata.create_all(engine)
    print("✅ Base de données initialisée")
