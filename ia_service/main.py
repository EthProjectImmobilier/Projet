from fastapi import FastAPI, HTTPException, Query
import joblib
import pandas as pd
import numpy as np
import uvicorn
from datetime import datetime
import os
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Optional
import random
import analytics_engine # Import the new module
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Pricing & Recommendation & Analytics Service")

MODEL_PATH = os.getenv("PRICING_MODEL_PATH", "pricing_model.joblib")
RISK_MODEL_PATH = os.getenv("RISK_MODEL_PATH", "risk_model.joblib")

MODEL = None
RISK_MODEL = None

# --- DATA AUGMENTATION & MOCK DATA ---
# Real Properties (IDs 1-5) - Synced with User DB (All Active, all Apartments in sample)
REAL_PROPERTIES = [
    {"id": 1, "city": "Casablanca", "pricePerNight": 1.0e-7, "bedrooms": 3, "type": "APARTMENT", "lat": 33.5731, "lon": -7.5898},
    {"id": 2, "city": "Rabat", "pricePerNight": 2.0e-7, "bedrooms": 3, "type": "APARTMENT", "lat": 34.0209, "lon": -6.8416},
    {"id": 3, "city": "Agadir", "pricePerNight": 1.0e-7, "bedrooms": 3, "type": "APARTMENT", "lat": 30.4278, "lon": -9.5981},
    {"id": 4, "city": "Fes", "pricePerNight": 1.0e-7, "bedrooms": 3, "type": "APARTMENT", "lat": 34.0181, "lon": -5.0078},
    {"id": 5, "city": "Tanger", "pricePerNight": 3.0e-7, "bedrooms": 4, "type": "APARTMENT", "lat": 35.7595, "lon": -5.8340}
]

# Generate 45 additional mock properties to reach 50 total
MOCK_TYPES = ["APARTMENT", "HOUSE", "VILLA", "STUDIO", "LOFT"]
MOCK_CITIES = ["Marrakech", "Essaouira", "Meknes", "Oujda", "Tetouan"]

ALL_PROPERTIES = REAL_PROPERTIES.copy()

def generate_mock_data():
    for i in range(6, 51):
        # Generate small ETH-like prices distinct from real ones to create variance
        # Range: 0.5E-7 to 5.0E-7
        random_price = random.uniform(0.5e-7, 5.0e-7)
        prop = {
            "id": i,
            "city": random.choice(MOCK_CITIES),
            "pricePerNight": float(f"{random_price:.10f}"), 
            "bedrooms": random.randint(1, 5),
            "type": random.choice(MOCK_TYPES),
            "lat": 30.0 + random.random() * 5, 
            "lon": -10.0 + random.random() * 5
        }
        ALL_PROPERTIES.append(prop)

generate_mock_data()

# --- ML MODELS INITIALIZATION ---
scaler = StandardScaler()
kmeans = KMeans(n_clusters=3, random_state=42)
df_properties = pd.DataFrame(ALL_PROPERTIES)

# Preprocessing for Clustering
# Convert Type to numeric codes for simplicity in this MVP
df_properties['type_code'] = df_properties['type'].astype('category').cat.codes
features_for_clustering = df_properties[['pricePerNight', 'bedrooms', 'type_code']]
scaled_features = scaler.fit_transform(features_for_clustering)

# Fit K-Means
df_properties['cluster'] = kmeans.fit_predict(scaled_features)

print("✅ Data Augmentation complete. Total properties:", len(df_properties))
print("✅ K-Means Clustering complete. Clusters created.")


if os.path.exists(MODEL_PATH):
    MODEL = joblib.load(MODEL_PATH)
    print("✅ Modèle Pricing chargé")

if os.path.exists(RISK_MODEL_PATH):
    RISK_MODEL = joblib.load(RISK_MODEL_PATH)
    print("✅ Modèle Risk chargé")


@app.get("/api/v1/recommendations")
async def get_recommendations(user_budget: float = Query(..., gt=0)):
    """
    Retourne les IDs des propriétés recommandées (parmi les IDs réels 1-5)
    basé sur la similarité cosinus avec le budget de l'utilisateur.
    """
    try:
        # 1. Create a user profile vector (Budget, Avg Bedrooms (assume 2), Avg Type (assume 0))
        # Ideally we would get more user info, but budget is the main constraint here.
        user_vector = np.array([[user_budget, 2, 0]]) 
        
        # Scale user vector using the same scaler as properties
        # Note: This is an approximation since we fit on property data
        user_vector_scaled = scaler.transform(user_vector)
        
        # 2. Calculate Cosine Similarity between User and All Properties
        similarities = cosine_similarity(user_vector_scaled, scaled_features)
        
        # Add similarity score to dataframe
        df_properties['similarity'] = similarities[0]
        
        # 3. Filter and Sort
        # We only want to recommend the REAL properties (IDs 1-5) to the frontend
        # but we use the whole dataset for the clustering context.
        real_props_df = df_properties[df_properties['id'] <= 5].copy()
        
        # Sort by similarity (descending)
        recommendations = real_props_df.sort_values(by='similarity', ascending=False)
        
        # 4. Return sorted IDs
        recommended_ids = recommendations['id'].tolist()
        
        return {
            "user_budget": user_budget,
            "recommended_property_ids": recommended_ids,
            "debug_scores": recommendations[['id', 'pricePerNight', 'similarity']].to_dict(orient='records')
        }

    except Exception as e:
        print(f"Erreur Recommandation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/pricing/suggest")
async def get_suggested_price(property_id: int, date: str):
    """
    Endpoint appelé par le service Java.
    Calcule un prix basé sur : l'IA (XGBoost) + Saisonnalité + Week-end.
    """
    if MODEL is None:
        raise HTTPException(status_code=500, detail="Modèle IA non chargé sur le serveur")

    try:
        # 1. Analyse de la date
        # Format attendu : YYYY-MM-DD
        dt = datetime.strptime(date, "%Y-%m-%d")
        month = dt.month
        is_weekend = dt.weekday() >= 4  # Vendredi, Samedi, Dimanche

        # 2. Simulation des caractéristiques selon l'ID
        # (Dans un vrai projet, on recevrait ça en POST ou via une DB)
        if property_id == 1:
            lat, lon, rooms, baths, guests = 48.85, 2.35, 2, 1, 4  # Paris
            city_premium = 1.6
        elif property_id == 2:
            lat, lon, rooms, baths, guests = 43.71, 7.26, 4, 2, 8  # Nice
            city_premium = 1.4
        else:
            # Valeurs par défaut pour les nouvelles propriétés
            lat, lon, rooms, baths, guests = 45.0, 5.0, 1, 1, 2
            city_premium = 1.0

        # 3. Préparation pour XGBoost (doit correspondre aux colonnes du train)
        features = pd.DataFrame([{
            "lat": lat,
            "lon": lon,
            "bedrooms": rooms,
            "bathrooms": baths,
            "maxGuests": guests,
            "amenities_count": 5,
            "rating": 4.5,
            "city_premium": city_premium
        }])

        # 4. Calcul du prix de base par l'IA
        base_prediction = MODEL.predict(features)[0]

        # 5. Application des règles dynamiques (Saisonnalité)
        multiplier = 1.0
        
        # Boost été (Juin, Juillet, Août)
        if month in [6, 7, 8]:
            multiplier += 0.30
        # Boost Hiver / Fêtes (Décembre)
        elif month == 12:
            multiplier += 0.20
        
        # Boost Week-end (+10%)
        if is_weekend:
            multiplier += 0.10

        # 6. Calcul final incluant ton idée de rendement (+12% yield)
        yield_multiplier = 1.12
        final_price = base_prediction * multiplier * yield_multiplier

        return {
            "propertyId": property_id,
            "suggested_price_eth": round(float(final_price), 4),
            "details": {
                "base_ai_price": round(float(base_prediction), 4),
                "season_impact": f"+{int((multiplier-1)*100)}%",
                "yield_bonus": "12%",
                "is_weekend": is_weekend,
                "month": month
            },
            "status": "success"
        }

    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/risk/score/{user_id}")
async def get_risk_score(user_id: int, cancel_count: int, bad_reviews: int, wallet_verified: bool):
    try:
        # 1. Préparer les données pour le modèle
        features = pd.DataFrame([{
            "cancel_count": cancel_count,
            "bad_reviews": bad_reviews,
            "wallet_verified": 1 if wallet_verified else 0
        }])

        # 2. Prédire la probabilité de confiance (0 à 1)
        # predict_proba renvoie [probabilité de 0, probabilité de 1]
        if RISK_MODEL:
             proba_trust = RISK_MODEL.predict_proba(features)[0][1]
        else:
             proba_trust = 0.8 # Fallback if model not loaded

        
        # 3. Convertir en score sur 100
        score = int(proba_trust * 100)
        
        # 4. Déterminer le niveau de risque
        risk_level = "LOW"
        if score < 40: risk_level = "HIGH"
        elif score < 70: risk_level = "MEDIUM"

        return {
            "userId": user_id,
            "score": score,
            "risk_level": risk_level,
            "details": {
                "cancel_impact": cancel_count * -5,
                "verification_bonus": 20 if wallet_verified else 0
            }
        }
    except Exception as e:
        return {"userId": user_id, "score": 100, "risk_level": "UNKNOWN", "error": str(e)}

@app.get("/api/v1/analytics/trends")
async def get_market_trends():
    """
    Returns market analysis:
    1. Forecasted prices for next 30 days for each major city.
    2. Best Model selected empirically (RandomForest vs Holt-Winters).
    3. Market Cluster (Grouping cities by trend similarity).
    """
    try:
        results = analytics_engine.get_market_analysis()
        return {"status": "success", "data": results}
    except Exception as e:
        print(f"Analytics Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Lancement du serveur avec configuration .env
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)

