# 🩺 Pregnancy Health Risk Level Prediction (ML Project)

This project involves predicting the **Risk Level** of pregnant women based on various health parameters using supervised machine learning models. The goal is to assist healthcare providers in identifying high-risk pregnancies using data-driven insights.

---

## 📊 Dataset Overview

The dataset contains the following features:

- Age  
- Systolic BP  
- Diastolic BP  
- Blood Sugar (BS)  
- Body Temperature  
- BMI  
- Previous Complications  
- Preexisting Diabetes  
- Gestational Diabetes  
- Mental Health  
- Heart Rate  
- Risk Level (Target Variable)

---

## 🧹 Data Preprocessing

- Missing values handled using **KNN Imputer** for numeric features.
- Outliers treated using **Z-score** (threshold ±3).
- Categorical variables label encoded.
- Exploratory Data Analysis (EDA) and visualizations performed using `seaborn` and `matplotlib`.

---

## 🤖 Machine Learning Models Used

- Logistic Regression  
- Decision Tree Classifier  
- Random Forest Classifier  
- K-Nearest Neighbors  
- Support Vector Machine  
- (Optional) XGBoost (Tried but not included due to compatibility issues)

**Model Evaluation Metrics:**
- Accuracy
- Classification Report (Precision, Recall, F1-score)
- Confusion Matrix

---

## ✅ Best Performing Model

- **Random Forest Classifier** achieved the highest accuracy and balanced performance across all classes.
- Hyperparameter tuning can be performed for further optimization.

---

## 📌 Key Insights

- Features like **Previous Complications**, **BMI**, and **Blood Sugar** showed strong correlation with Risk Level.
- KNN Imputer preserved data trends better than mean/median imputation.
- Random Forest provided better generalization and handled non-linearities effectively.

---

## 📁 Folder Structure

```

📦PregnancyRiskPrediction
┣ 📜README.md
┣ 📜data.csv
┣ 📜notebook.ipynb
┗ 📜requirements.txt

````

---

## 🚀 How to Run

```bash
git clone https://github.com/your-username/PregnancyRiskPrediction.git
cd PregnancyRiskPrediction
pip install -r requirements.txt
````

Open the `notebook.ipynb` file and run the cells in order.

---

## 📬 Contact

Created with ❤️ by **Kumari Shivangi**
📧 Email: info.kumarishivangi@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/kumarishivangi7)

```
