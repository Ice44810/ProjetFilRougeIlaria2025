from flask import Flask
from flask_cors import CORS
from routes import api
from database import init_db

app = Flask(__name__)
CORS(app)
app.register_blueprint(api, url_prefix="/api")

# Initialisation de la base de données
init_db()

if __name__ == "__main__":
    app.run(debug=True)
