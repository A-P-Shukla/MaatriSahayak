import pandas as pd
import pickle
import numpy as np

# Load the model
model_path = 'maatrisahyak.pkl'
with open(model_path, 'rb') as f:
    model = pickle.load(f)

print(f"Loaded model type: {type(model)}")

# Load a few sample records from the dataset
csv_path = 'content/Dataset - Updated.csv'
df = pd.read_csv(csv_path)

# Separate features & targets as per standard ML splits
if 'Risk Level' in df.columns:
    X = df.drop(columns=['Risk Level'])
    y = df['Risk Level']
else:
    X = df

# Basic information to help debugging
print("Feature columns from CSV:")
print(X.columns.tolist())

# Try predicting the first 5 rows
print("\n--- Testing Model Predictions on First 5 Rows ---")
try:
    predictions = model.predict(X.head())
    print("Predictions:", predictions)
    if 'Risk Level' in df.columns:
        print("Actuals:    ", y.head().tolist())
except Exception as e:
    print(f"Prediction failed with error: {e}")
    # Sometimes Random Forests or Pipelines expect scikit-learn preprocessing
    print("This implies the model expects transformed data or specific feature names.")

# Further inspection of the loaded model object if it's a RandomForestClassifier
if hasattr(model, 'feature_names_in_'):
    print("\nFeatures expected by the model:")
    print(model.feature_names_in_)
elif hasattr(model, 'steps'): # it's a Pipeline
    print("\nPipeline steps:")
    for step_name, step_obj in model.steps:
        print(f" - {step_name}: {type(step_obj)}")
    # If the first step is preprocessing, and the last is RF, we can check expected features:
    if hasattr(model.steps[0][1], 'feature_names_in_'):
         print("Pipeline starting features:", model.steps[0][1].feature_names_in_)

print("\n--- Test script execution complete ---")
