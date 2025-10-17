**Projet FilRouge Ilaria 2025**



S'aider de l'IA pour la structuration Github: 

je suis developpeur full stack en formation. j'ai un projet fil rouge à réaliser. Mon projet consistera a créer un application web de gestion de budget personnel, web permettant aux utilisateurs de suivre leurs dépenses et

revenus, de catégoriser les transactions, et de visualiser l'évolution de leur budget au fil du temps

grâce à des graphiques interactifs.. Je suis en cours git et github et on doit structurer notre repo pour le projet. Je compte utiliser html, css js pour le frontend. Pour le back, je pense utiliser python. Quelle structure de projet me conseilles-tu? fais des recherches sur internet car nous sommes en octobre 2025



**- Organisation des dossiers :** 

	**- (Nom Framework frontend) lequel j'ai choisi)**

		**à l'intérieur** 

	**- Backend (Nodejs ou Python ou PHP)**

	**- Documentation (mettre le projet choisi + explication de mon travail effectué)**

	**- Html-Css**

	**- Base de données (MySQL, MongoDB, PostgreSQL…)**



**🚀 Structure complète du projet : budget\_app/**



**Ci-dessous, tu trouveras tous les fichiers et dossiers avec un contenu de départ minimal — il te suffit de copier tout ça dans un dossier local, puis :**



**git init**

**git add .**

**git commit -m "Initialisation du projet fil rouge"**

**git branch -M main**

**git remote add origin <ton\_repo\_github>**

**git push -u origin main**



**Arborescence finale**

**budget\_app/**

**├─ .gitignore**

**├─ README.md**

**├─ requirements.txt**

**│**

**├─ frontend/**

**│  ├─ index.html**

**│  ├─ assets/**

**│  │  ├─ style.css**

**│  │  └─ app.js**

**│  ├─ pages/**

**│  │  ├─ dashboard.html**

**│  │  └─ transactions.html**

**│  └─ images/**

**│     └─ logo.png**

**│**

**├─ backend/**

**│  ├─ app.py**

**│  ├─ routes.py**

**│  ├─ models.py**

**│  ├─ controllers.py**

**│  ├─ database.py**

**│  ├─ schemas.py**

**│  └─ tests/**

**│     └─ test\_api.py**

**│**

**├─ data/**

**│  └─ (vide au départ)**

**│**

**└─ docs/**

   **├─ notes\_fonctionnelles.md**

   **└─ wireframes.png**



 **FICHIERS DU PROJET**

**.gitignore**

**\_\_pycache\_\_/**

**\*.pyc**

**data/budget.db**

**.env**

**.vscode/**



**README.md**

**#  BudgetApp**



**Application web de \*\*gestion de budget personnel\*\*.**



**##  Description**

**Cette application permet de suivre ses \*\*revenus\*\* et \*\*dépenses\*\*, de les \*\*catégoriser\*\*, et de \*\*visualiser son budget\*\* à l’aide de graphiques.**



**##  Technologies**

**- Frontend : HTML / CSS / JavaScript**

**- Backend : Python (Flask)**

**- Base de données : SQLite**





