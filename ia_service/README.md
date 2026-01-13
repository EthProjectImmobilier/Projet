# AI Service

## Description
Ce service fournit des fonctionnalités d’IA pour la plateforme : recommandations de propriétés, suggestion de prix, scoring de risque utilisateur, et analytics de marché. Il expose une API REST (FastAPI) et utilise des modèles ML (XGBoost, scikit-learn, joblib).

## Fonctionnalités principales
- **Recommandation de propriétés** selon le budget utilisateur (cosine similarity, clustering)
- **Suggestion de prix** pour une propriété à une date donnée (modèle XGBoost, saisonnalité, week-end, rendement)
- **Scoring de risque utilisateur** (modèle ML, features : annulations, avis, wallet vérifié)
- **Analytics de marché** (prévisions de prix, clustering de villes, modèles RandomForest/Holt-Winters)

## Structure
- `main.py` : API FastAPI, endpoints principaux
- `analytics_engine.py` : Analytics avancés, génération de données, prévisions, clustering
- `models/` : Modèles ML sauvegardés (joblib)
- `train_pricing.py`, `train_risk_model.py` : Scripts d’entraînement des modèles

## Endpoints principaux
- `GET /api/v1/recommendations` : recommandations de propriétés selon budget
- `GET /api/v1/pricing/suggest` : suggestion de prix pour une propriété/date
- `GET /api/v1/risk/score/{user_id}` : scoring de risque utilisateur
- `GET /api/v1/analytics/trends` : tendances et prévisions du marché

## Lancement local
1. **Prérequis** : Python 3.10+, pip
2. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```
3. **(Optionnel) Entraîner les modèles** :
   ```bash
   python train_pricing.py
   python train_risk_model.py
   ```
4. **Lancer le serveur** :
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Configuration
- Variables d’environnement supportées (voir `.env.example`)
- Chemins des modèles, port, etc.

## Dépendances principales
- FastAPI, Uvicorn
- scikit-learn, XGBoost, joblib, pandas, numpy
- python-dotenv

---

Pour toute extension (ex : nouveaux modèles, nouvelles features, etc.), voir `main.py` et `analytics_engine.py`.
