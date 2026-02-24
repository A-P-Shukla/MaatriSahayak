import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
import pickle

df=pd.read_csv('./content/Dataset - Updated.csv')

# Handle missing data like the notebook does
features_to_impute = ['Systolic BP', 'Diastolic', 'BS', 'BMI',
                      'Previous Complications', 'Preexisting Diabetes', 'Heart Rate']
df_numeric = df[features_to_impute]

scaler = StandardScaler()
df_scaled = scaler.fit_transform(df_numeric)

imputer = KNNImputer(n_neighbors=5)
df_imputed_array = imputer.fit_transform(df_scaled)

df_imputed = pd.DataFrame(scaler.inverse_transform(df_imputed_array),
                          columns=features_to_impute)
df[features_to_impute] = df_imputed

# Separate missing Risk Levels
df_with_risk = df[df['Risk Level'].notnull()].copy()
df_missing_risk = df[df['Risk Level'].isnull()].copy()

# Enforce Inverted Mapping (High: 1, Low: 0)
df_with_risk['Risk Level Encoded'] = df_with_risk['Risk Level'].map({'Low': 0, 'High': 1})

# Train Model to fill missing risks
X = df_with_risk.drop(['Risk Level', 'Risk Level Encoded'], axis=1)
y = df_with_risk['Risk Level Encoded']
model = RandomForestClassifier(random_state=42)
model.fit(X, y)

# Predict missing
X_missing = df_missing_risk.drop(['Risk Level'], axis=1)
if len(X_missing) > 0:
    predicted_risks = model.predict(X_missing)
    df_missing_risk['Risk Level'] = pd.Series(predicted_risks).map({0: 'Low', 1: 'High'}).values

# Combine back
df = pd.concat([df_with_risk.drop('Risk Level Encoded', axis=1), df_missing_risk], ignore_index=True)

# Final Encoding for actual model
df['Risk Level Encoded'] = df['Risk Level'].map({'Low': 0, 'High': 1})
X = df.drop(['Risk Level', 'Risk Level Encoded'], axis=1)
y = df['Risk Level Encoded']

# Standard split like notebook
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

from sklearn.metrics import accuracy_score, classification_report

# Fit Final Random Forest Classifier
randclf = RandomForestClassifier(random_state=42)
randclf.fit(X_train, y_train)

# Evaluate Model
y_pred = randclf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print("Model Accuracy:", round(acc, 4))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Low', 'High']))

# Save to pkl
pickle.dump(randclf, open('maatrisahyak.pkl', 'wb'))
print("\nSuccessfully retrained the model with inverted labels and saved to maatrisahyak.pkl")
