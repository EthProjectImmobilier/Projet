import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor

def train_and_save_model():
    print("⏳ Création des données d'entraînement...")
    data = []
    # On génère 2000 fausses locations pour que l'IA devienne "intelligente"
    for _ in range(2000):
        bedrooms = np.random.randint(1, 6)
        bathrooms = np.random.randint(1, 3)
        # Logique de prix simplifiée : 0.05 ETH par chambre + bonus selon la zone
        # On simule une zone attractive (ex: centre ville) entre Lat 43-48
        lat = np.random.uniform(33, 50) 
        lon = np.random.uniform(-10, 15)
        
        base_price = (bedrooms * 0.04) + (bathrooms * 0.02)
        # On ajoute un peu de réalisme (bruit aléatoire)
        price_eth = base_price + np.random.normal(0, 0.005)
        
        data.append({
            "lat": lat,
            "lon": lon,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "maxGuests": bedrooms * 2,
            "amenities_count": np.random.randint(2, 12),
            "rating": np.random.uniform(3.0, 5.0),
            "city_premium": np.random.uniform(1.0, 1.8),
            "price_eth": max(0.01, price_eth) # Prix minimum 0.01 ETH
        })

    df = pd.DataFrame(data)
    
    # Séparation des données
    X = df.drop("price_eth", axis=1)
    y = df["price_eth"]

    print("🤖 Entraînement du modèle XGBoost...")
    model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
    model.fit(X, y)

    # SAUVEGARDE DU MODÈLE
    joblib.dump(model, "pricing_model.joblib")
    print("✅ Modèle 'pricing_model.joblib' créé avec succès !")

if __name__ == "__main__":
    train_and_save_model()