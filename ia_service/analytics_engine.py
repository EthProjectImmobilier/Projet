import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import joblib
import random
from datetime import datetime, timedelta

# --- 1. DATA GENERATION (Synthetic History) ---
# We simulate 12 months of history for our 5 cities (to avoid empty DB issues)

CITIES = ["Casablanca", "Rabat", "Agadir", "Fes", "Tanger"]
BASE_PRICES = {
    "Casablanca": 1.0e-7,
    "Rabat": 2.0e-7,
    "Agadir": 1.0e-7,
    "Fes": 1.0e-7,
    "Tanger": 3.0e-7
}

def generate_historical_data(days=365):
    """
    Generates synthetic daily average price data for each city over the last year.
    Includes seasonality (Summer high, Winter low) and random noise.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    all_data = []

    for city in CITIES:
        base = BASE_PRICES[city]
        
        # Seasonality factors
        # Summer (Jun-Aug) = +30%, Dec = +20%
        seasonality = []
        for d in dates:
            m = d.month
            factor = 1.0
            if m in [6, 7, 8]: factor = 1.3
            elif m == 12: factor = 1.2
            
            # Weekend bump
            if d.weekday() >= 4: factor += 0.1
            
            # Random market fluctuation (-10% to +10%)
            noise = random.uniform(0.9, 1.1)
            
            seasonality.append(factor * noise)
            
        prices = [base * f for f in seasonality]
        
        city_df = pd.DataFrame({
            'date': dates,
            'city': city,
            'avg_price': prices
        })
        all_data.append(city_df)
        
    return pd.concat(all_data, ignore_index=True)

# --- 2. MODEL SELECTION & FORECASTING ---

def align_features(X, expected_features):
    """
    Ensures X has exactly the expected_features columns.
    Adds missing columns with 0, removes extra columns, and reorders.
    """
    # 1. Add missing cols
    for col in expected_features:
        if col not in X.columns:
            X[col] = 0

    # 2. Drop extra cols (that are NOT in expected)
    # Be careful not to drop ALL cols if something is wrong.
    # intersection keeps only what's in expected, but we need to match ORDER too.
    
    # 3. Reorder to match expected_features exactly
    return X[expected_features]

def train_and_forecast(city_df, forecast_days=30):
    """
    Empirical Model Selection:
    1. Trains Random Forest
    2. Trains Holt-Winters (Exponential Smoothing)
    3. Compares RMSE on last 30 days validation set
    4. Picks Winner & Forecasts next 30 days
    """
    # Split Train/Test (Last 30 days for validation)
    train_size = len(city_df) - 30
    train = city_df.iloc[:train_size].copy()
    test = city_df.iloc[train_size:].copy()
    
    # --- Model A: Random Forest (ML) ---
    # Feature Engineering for RF
    def create_features(df):
        df = df.copy()
        df['day_of_year'] = df['date'].dt.dayofyear
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['lag_1'] = df['avg_price'].shift(1)
        df['lag_7'] = df['avg_price'].shift(7)
        df = df.dropna()
        return df

    df_rf = create_features(city_df)
    
    # We need to re-split after feature engineering (rows dropped due to lags)
    train_rf = df_rf.iloc[:len(df_rf)-30]
    test_rf = df_rf.iloc[len(df_rf)-30:]
    
    features = ['day_of_year', 'month', 'day_of_week', 'lag_1', 'lag_7']
    X_train = train_rf[features]
    y_train = train_rf['avg_price']
    X_test = test_rf[features]
    y_test = test_rf['avg_price']
    
    rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X_train, y_train)
    pred_rf = rf.predict(X_test)
    rmse_rf = np.sqrt(mean_squared_error(y_test, pred_rf))
    
    # --- Model B: Exponential Smoothing (Statistical) ---
    # HW works on univariate time series
    try:
        # Ensure index has frequency for statsmodels
        ts_train = train.set_index('date')['avg_price']
        ts_train.index.freq = 'D'
        
        hw = ExponentialSmoothing(ts_train, seasonal_periods=7, trend='add', seasonal='add').fit()
        pred_hw = hw.forecast(steps=len(test))
        rmse_hw = np.sqrt(mean_squared_error(test['avg_price'], pred_hw))
    except Exception as e:
        print(f"HW Forecast Error: {e}")
        rmse_hw = float('inf') # Fallback if fails
        
    # --- Selection ---
    winner = "Random Forest" if rmse_rf < rmse_hw else "Holt-Winters"
    
    # --- Final Forecast (Next 30 Days) ---
    last_date = city_df['date'].max()
    future_dates = pd.date_range(start=last_date + timedelta(days=1), periods=forecast_days, freq='D')
    
    future_prices = []
    
    if winner == "Holt-Winters":
        try:
            # Refit on FULL data
            ts_full = city_df.set_index('date')['avg_price']
            ts_full.index.freq = 'D'
            
            full_hw = ExponentialSmoothing(ts_full, seasonal_periods=7, trend='add', seasonal='add').fit()
            future_prices = full_hw.forecast(steps=forecast_days).tolist()
        except:
             # Fallback to RF if HW refit fails
             winner = "Random Forest (Fallback)"
    else:
        # Refit RF on FULL data
        X_full = df_rf[features]
        y_full = df_rf['avg_price']
        rf.fit(X_full, y_full)
        
        # Recursive forecasting for RF (since we need lags)
        last_row = df_rf.iloc[-1]
        current_lag_1 = last_row['avg_price']
        # Approximate lag_7 for future using recent history
        recent_prices = list(df_rf['avg_price'].values[-7:])
        
        for i in range(forecast_days):
            next_date = future_dates[i]
            feat_dict = {
                'day_of_year': next_date.dayofyear,
                'month': next_date.month,
                'day_of_week': next_date.dayofweek,
                'lag_1': current_lag_1,
                'lag_7': recent_prices[0] # Very simple rolling
            }
            # Update rolling
            pred = rf.predict(pd.DataFrame([feat_dict]))[0]
            future_prices.append(pred)
            
            current_lag_1 = pred
            recent_prices.pop(0)
            recent_prices.append(pred)

    return {
        "city": city_df['city'].iloc[0],
        "model_used": winner,
        "rmse_error": float(min(rmse_rf, rmse_hw)),
        "forecast": [{"date": str(d.date()), "price": float(p)} for d, p in zip(future_dates, future_prices)]
    }

# --- 3. CLUSTERING ---

def cluster_cities(df_history):
    """
    Groups cities by their price shape (Normalized).
    """
    # Pivot: Index=Date, Cols=City, Values=Price
    pivoted = df_history.pivot(index='date', columns='city', values='avg_price')
    
    # Normalize each city's curve (MinMax) so we cluster by SHAPE not Magnitude
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(pivoted) # Returns shape (days, cities)
    
    # We want to cluster Cities (Columns), so transpose
    X = scaled_data.T 
    
    # KMeans (Fixed 3 clusters for simplicity: Stable, Seasonally High, Volatile/Growing)
    kmeans = KMeans(n_clusters=3, random_state=42)
    labels = kmeans.fit_predict(X)
    
    results = {}
    for city, label in zip(pivoted.columns, labels):
        # Auto-labeling (Simplified)
        cluster_name = f"Cluster {label}" 
        results[city] = cluster_name
        
    return results

def get_market_analysis():
    df = generate_historical_data()
    
    # 1. Forecasting
    forecasts = []
    for city in CITIES:
        city_data = df[df['city'] == city]
        forecasts.append(train_and_forecast(city_data))
        
    # 2. Clustering
    clusters = cluster_cities(df)
    
    # 3. Combine
    for f in forecasts:
        f['market_cluster'] = clusters.get(f['city'], "Unknown")
        
    return forecasts
