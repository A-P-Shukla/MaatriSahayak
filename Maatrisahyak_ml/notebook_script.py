import numpy as np
import pandas as pd

df=pd.read_csv('./content/Dataset - Updated.csv')

df.head()

df.isnull().sum()

from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler

# Define columns to impute
features_to_impute = ['Systolic BP', 'Diastolic', 'BS', 'BMI',
                      'Previous Complications', 'Preexisting Diabetes', 'Heart Rate']

# Extract those columns
df_numeric = df[features_to_impute]

# Scale the data (KNN works better with scaled data)
scaler = StandardScaler()
df_scaled = scaler.fit_transform(df_numeric)

# Apply KNN imputer
imputer = KNNImputer(n_neighbors=5)
df_imputed_array = imputer.fit_transform(df_scaled)

# Reverse scaling (back to original units)
df_imputed = pd.DataFrame(scaler.inverse_transform(df_imputed_array),
                          columns=features_to_impute)

# Save imputed data back into original df
df[features_to_impute] = df_imputed

df.info()

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Separate data
df_with_risk = df[df['Risk Level'].notnull()]
df_missing_risk = df[df['Risk Level'].isnull()]

# Encode Risk Level if it's categorical
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df_with_risk['Risk Level Encoded'] = le.fit_transform(df_with_risk['Risk Level'])

# Define features (use all except Risk Level)
X = df_with_risk.drop(['Risk Level', 'Risk Level Encoded'], axis=1)
y = df_with_risk['Risk Level Encoded']

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X, y)

# Predict missing risk levels
X_missing = df_missing_risk.drop(['Risk Level'], axis=1)
predicted_risks = model.predict(X_missing)

# Convert back to original labels
df_missing_risk['Risk Level'] = le.inverse_transform(predicted_risks)

# Combine both parts
df = pd.concat([df_with_risk.drop('Risk Level Encoded', axis=1), df_missing_risk], ignore_index=True)

import seaborn as sns
import matplotlib.pyplot as plt

# Histogram of all numeric features
df.hist(figsize=(15, 10), edgecolor='black')
plt.suptitle("Distribution of Numerical Features", fontsize=16)
plt.tight_layout()
plt.show()


# Boxplots for each numerical feature
numeric_cols = ['Age', 'Systolic BP', 'Diastolic', 'BS', 'Body Temp', 'BMI', 'Heart Rate']

plt.figure(figsize=(15, 10))
for i, col in enumerate(numeric_cols):
    plt.subplot(3, 3, i + 1)
    sns.boxplot(x=df[col], color='lightblue')
    plt.title(f'Boxplot of {col}')
plt.tight_layout()
plt.show()


plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='coolwarm', fmt=".2f")
plt.title("Correlation Heatmap")
plt.show()


sns.countplot(x='Risk Level', data=df, palette='Set2')
plt.title('Risk Level Class Distribution')
plt.show()

# Choose a few most important features
key_features = ['Age', 'Systolic BP', 'BS', 'BMI', 'Heart Rate', 'Risk Level']
sns.pairplot(df[key_features], hue='Risk Level', palette='husl', diag_kind='kde')
plt.suptitle("Pairplot of Key Features Colored by Risk Level", y=1.02)
plt.show()


cat_features = ['Previous Complications', 'Preexisting Diabetes', 'Gestational Diabetes', 'Mental Health']

plt.figure(figsize=(15, 10))
for i, col in enumerate(cat_features):
    plt.subplot(2, 2, i + 1)
    sns.countplot(data=df, x=col, hue='Risk Level', palette='viridis')
    plt.title(f'{col} vs Risk Level')
    plt.legend(loc='upper right')
plt.tight_layout()
plt.show()


from scipy.stats import zscore

z_scores = df[numeric_cols].apply(zscore)
outliers_z = (z_scores.abs() > 3).sum()
print("Z-score Outliers (>3 or <-3):")
print(outliers_z)


def cap_outliers(col):
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    df[col] = np.where(df[col] < lower, lower,
                       np.where(df[col] > upper, upper, df[col]))

for col in ['Age', 'Systolic BP', 'Diastolic', 'BS', 'Body Temp', 'BMI']:
    cap_outliers(col)


from scipy.stats import zscore

z_scores = df[numeric_cols].apply(zscore)
outliers_z = (z_scores.abs() > 3).sum()
print("Z-score Outliers (>3 or <-3):")
print(outliers_z)

# Boxplots for each numerical feature
numeric_cols = ['Age', 'Systolic BP', 'Diastolic', 'BS', 'Body Temp', 'BMI', 'Heart Rate']

plt.figure(figsize=(15, 10))
for i, col in enumerate(numeric_cols):
    plt.subplot(3, 3, i + 1)
    sns.boxplot(x=df[col], color='lightblue')
    plt.title(f'Boxplot of {col}')
plt.tight_layout()
plt.show()


import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# ML Algorithms
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from scipy import stats
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier

#Encode target label
le = LabelEncoder()
df['Risk Level Encoded'] = le.fit_transform(df['Risk Level'])

# Split features & target
X = df.drop(['Risk Level', 'Risk Level Encoded'], axis=1)
y = df['Risk Level Encoded']

#Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

#Feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Define models
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(),
    "KNN": KNeighborsClassifier(),
    "SVM": SVC(),
    "Gradient Boosting": GradientBoostingClassifier(),
    "AdaBoost": AdaBoostClassifier(),
    "Naive Bayes": GaussianNB(),
}

# Train and evaluate each model
results = {}

for name, model in models.items():
    print(f"\n🔷 Model: {name}")

    # Use scaled data for some models
    if name in ['Logistic Regression', 'KNN', 'SVM']:
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
    else:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    results[name] = acc

    print("Accuracy:", round(acc, 4))
    print(classification_report(y_test, y_pred, target_names=le.classes_))


# Visualize model accuracy
plt.figure(figsize=(10, 5))
plt.bar(results.keys(), results.values(), color='lightgreen')
plt.ylabel('Accuracy')
plt.title('ML Model Comparison - Risk Level Prediction')
plt.xticks(rotation=45)
plt.grid(True)
plt.tight_layout()
plt.show()

import pickle
from sklearn.ensemble import RandomForestClassifier
randclf = RandomForestClassifier()
randclf.fit(X_train, y_train)
y_pred = randclf.predict(X_test)
print(accuracy_score(y_test, y_pred))
pickle.dump(randclf, open('maatrisahyak.pkl', 'wb'))

