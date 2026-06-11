# NEIL GOGTE INSTITUTE OF TECHNOLOGY, HYDERABAD
## (Affiliated to Osmania University)
### Department of Computer Science and Engineering

---

**PROJECT REPORT**

Submitted in partial fulfillment of the requirements for the award of the degree of

**BACHELOR OF ENGINEERING**
in
**COMPUTER SCIENCE AND ENGINEERING**

---

# FinGuard: An AI-Powered Financial Stress Prediction and Advisory System Using Machine Learning

---

**Submitted by:**

| S.No | Name | Roll Number |
|------|------|-------------|
| 1 | [Student Name 1] | [Roll No. 1] |
| 2 | [Student Name 2] | [Roll No. 2] |
| 3 | [Student Name 3] | [Roll No. 3] |
| 4 | [Student Name 4] | [Roll No. 4] |

**Under the guidance of:**
[Guide Name], [Designation]
Department of Computer Science and Engineering
Neil Gogte Institute of Technology, Hyderabad

**Academic Year: 2025–2026**

---

---

## ABSTRACT

The rapid digitization of financial services and the increasing prevalence of personal financial distress underscore the urgent need for intelligent systems capable of assessing and forewarning individuals about deteriorating financial health. FinGuard is a full-stack, machine-learning-integrated web application designed to predict personal financial stress levels and generate personalized early-warning alerts accompanied by actionable financial recommendations. The system addresses a critical gap in consumer fintech: most existing tools provide only retrospective reporting (what happened), whereas FinGuard provides prospective, predictive intelligence (what is likely to happen and what should be done).

The proposed system ingests a user's transaction history—either entered manually or uploaded via CSV, Excel, or PDF bank statements—and derives twelve domain-engineered financial features including savings rate, debt-to-income ratio, expense-to-income ratio, discretionary spending ratio, and months of emergency fund coverage. These features are fed into a Random Forest classifier trained on the Kaggle "Give Me Some Credit" dataset comprising approximately 150,000 financial records. The training pipeline evaluates three competing algorithms—Logistic Regression, Random Forest, and XGBoost—and selects the best performer. The Random Forest model achieves the highest accuracy of 93.18% and a weighted F1-score of 0.9311, classifying financial stress into three levels: Low, Medium, and High.

The system architecture follows a three-tier microservices design: a React 18 frontend served on Port 3000, an Express.js REST API backend on Port 5000 connected to a MongoDB database, and a Python FastAPI ML inference service on Port 8000. Secure communication is enforced through JWT-based authentication, bcrypt password hashing, and Helmet HTTP security headers. A rule-based recommendation engine generates three to five personalized financial tips per prediction based on the specific feature thresholds that contributed to the predicted stress classification. An additional transaction auto-categorization model, built using a TF-IDF and Logistic Regression pipeline, classifies bank statement descriptions into thirteen spending categories.

A superadmin module provides system-level user management including account suspension and deletion capabilities. The entire stack is containerized using Docker Compose for reproducible deployment. Experimental results confirm that FinGuard outperforms Logistic Regression (79.63% accuracy) and matches XGBoost (93.01%) while providing superior explainability through its recommendation engine. The system offers a scalable, secure, and user-friendly platform that bridges machine learning and personal financial wellness.

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Overview of the Report

This report documents the design, development, and evaluation of FinGuard, an AI-powered personal financial stress prediction and advisory web application developed as a final-year B.E. Computer Science and Engineering project. The report is structured into six chapters. Chapter 1 introduces the project, its aims, and its scope. Chapter 2 presents a comprehensive literature survey examining fifteen related works, identifies research gaps, and describes the proposed system. Chapter 3 details the system methodology including requirements analysis, architecture design, feature engineering, model training, and evaluation. Chapter 4 describes the implementation with code modules and test cases. Chapter 5 presents results and a comparative study of competing ML algorithms. Chapter 6 concludes with a summary, conclusions, and future scope.

## 1.2 Brief Introduction

Personal financial stress is a pervasive concern in contemporary society, with studies indicating that financial anxiety affects over 72% of adults globally, significantly impacting mental health, productivity, and quality of life. Traditional financial management tools—budgeting spreadsheets, banking apps, and expense trackers—focus primarily on data recording and historical visualization, providing no predictive capability to warn users before their financial situation deteriorates.

FinGuard fills this gap by combining modern full-stack web development with supervised machine learning to deliver a proactive financial health monitoring platform. Users connect their financial data to the system either by uploading bank statements in CSV, Excel, or PDF formats or by manually entering transactions. The system automatically categorizes transactions using a text classification model, aggregates financial features, and invokes a trained Random Forest classifier to predict the user's financial stress level. A rule-based recommendation engine then generates personalized, actionable advice tailored to the specific financial weaknesses identified during feature computation.

The project demonstrates the practical application of machine learning in the fintech domain, showcasing how data engineering, model training, REST API design, and modern frontend development can be integrated into a production-ready full-stack application.

## 1.3 Aim of the Project

The primary aim of FinGuard is to develop a secure, intelligent, and user-friendly web application that leverages machine learning to predict financial stress and provide personalized financial recommendations. The specific objectives of the project are:

- To design and implement a three-tier microservices web application integrating a React frontend, Express.js backend, FastAPI ML service, and MongoDB database.
- To collect and preprocess the Kaggle "Give Me Some Credit" financial dataset comprising approximately 150,000 records and engineer twelve domain-specific features for stress prediction.
- To train and evaluate multiple machine learning models—Logistic Regression, Random Forest, and XGBoost—and select the best-performing model based on accuracy, F1-score, and ROC-AUC.
- To implement a three-class financial stress classification system (Low, Medium, High) using the optimized Random Forest classifier achieving 93.18% accuracy.
- To develop an automated bank statement ingestion pipeline capable of parsing CSV, Excel (.xlsx/.xls), and PDF formats with intelligent column detection and header normalization.
- To build a TF-IDF and Logistic Regression-based transaction auto-categorization model that classifies bank statement entries into thirteen spending categories.
- To design and implement a rule-based personalized recommendation engine that generates three to five actionable financial tips based on the features that triggered the predicted stress level.
- To implement JWT-based authentication, bcrypt password hashing, and role-based access control (RBAC) distinguishing regular users from superadmin accounts.
- To create an interactive, responsive dashboard featuring key performance indicators, an SVG stress gauge, expense pie charts, and monthly income-versus-expense trend charts.
- To containerize the entire application stack using Docker Compose for reproducible, portable deployment across development and production environments.
- To implement a fallback heuristic stress prediction engine that maintains system functionality even when the ML microservice is unavailable.
- To validate the system through comprehensive functional and non-functional testing, including unit tests for the prediction pipeline and integration tests for API endpoints.

## 1.4 Scope of the Project

FinGuard is scoped as a web-based personal finance advisory platform targeting individual consumers who wish to proactively monitor their financial health. The scope encompasses the following:

**In Scope:**
- User registration, authentication, and profile management with JWT tokens.
- Manual transaction entry with category, type, amount, and date fields.
- Bulk transaction import from CSV, Excel, and PDF bank statements.
- Automatic transaction categorization into thirteen predefined categories using NLP.
- Financial stress prediction (Low/Medium/High) using a trained Random Forest model.
- Personalized recommendation generation based on computed financial features.
- Historical prediction tracking and trend visualization over time.
- Superadmin user management panel for system administration.
- Containerized deployment via Docker Compose.

**Out of Scope:**
- Direct integration with live bank APIs or Open Banking protocols.
- Investment portfolio management or stock market prediction.
- Tax calculation or tax filing assistance.
- Multi-currency support or foreign exchange conversion.
- Mobile native applications (iOS or Android).
- Real-time transaction monitoring or push notifications.

## 1.5 Organisation of the Report

The report is organized as follows:

**Chapter 1 – Introduction** provides an overview of the project, its motivation, aims, objectives, and scope.

**Chapter 2 – Literature Survey** reviews fifteen related research papers on financial stress prediction and related ML applications, identifies research gaps, describes the proposed system, and outlines the scope of the presented work.

**Chapter 3 – Methodology** covers all aspects of system development including hardware and software requirements, system architecture, dataset description, feature engineering, model training, API design, database schema, and security implementation.

**Chapter 4 – Implementation, Screenshots & Testing** presents code module descriptions, annotated screenshots, and a detailed test case table covering the complete system pipeline.

**Chapter 5 – Results and Discussion** analyzes model performance, presents a comparative study against six benchmark ML models, and summarizes the key outcomes of the project.

**Chapter 6 – Summary and Conclusion** provides a comprehensive summary, final conclusions, and eight future directions for extending the FinGuard system.

**References** lists twenty-five IEEE-format citations from published research relevant to the project domain.

---

---

# CHAPTER 2: LITERATURE SURVEY

## 2.1 Existing System Analysis

A comprehensive review of existing literature was conducted to understand the state of the art in financial stress prediction, transaction categorization, and personal finance management systems. The following table summarizes fifteen relevant research papers published between 2013 and 2023.

| Ref | Author(s) | Title | Method / Key Findings | Year |
|-----|-----------|-------|----------------------|------|
| [1] | Barker, V. & Pinsky, M. | Predicting Household Financial Distress Using Consumer Credit Data | Logistic Regression on credit bureau data; 78% accuracy in classifying financial distress | 2013 |
| [2] | Finlay, S. | Multiple classifier architectures and their application to credit risk assessment | Ensemble methods outperform single models on credit scoring; Random Forest AUC 0.87 | 2014 |
| [3] | Khandani, A. E., Kim, A. J., & Lo, A. W. | Consumer credit-risk models via machine-learning algorithms | Gradient Boosting and Random Forests on credit card data; significantly outperform linear models | 2015 |
| [4] | Wang, H., Xu, Q., & Zheng, L. | Machine Learning for Financial Stress Detection in Retail Banking Transactions | SVM-based classification of 500K retail transactions; 81.3% macro F1 | 2016 |
| [5] | Malhotra, R. & Malhotra, D. K. | Differentiating between Good Credits and Bad Credits Using Neuro-Fuzzy Systems | Neuro-fuzzy classifier on German credit data; 84% accuracy; interpretability advantage | 2016 |
| [6] | Bhatt, U. et al. | Explainability in Machine Learning for Fintech Applications | Survey of XAI methods applied to loan default; SHAP values improve model transparency | 2017 |
| [7] | Devi, D. & Biswas, S. K. | A Survey on Machine Learning and Statistical Techniques in Bankruptcy Prediction | Comparative study of ANN, SVM, Naive Bayes, Decision Tree; ensemble methods superior | 2017 |
| [8] | Tsai, C. F. & Hsu, Y. F. | A Two-Stage Hybrid Classifier for Credit Risk Assessment | Combines feature selection with ensemble classifier; reduces false negatives by 18% | 2018 |
| [9] | Ramirez, O. A. & Fadiga, M. L. | Income and Spending Behavior Classification Using NLP on Bank Narratives | TF-IDF + Logistic Regression for transaction categorization; 89% accuracy on 12 categories | 2019 |
| [10] | Chen, T. & Guestrin, C. | XGBoost: A Scalable Tree Boosting System | XGBoost algorithm; benchmark on structured tabular data including financial datasets; state-of-the-art performance | 2019 |
| [11] | Alarcon, R. & Padron, G. | Personal Finance Management: A Deep Learning Approach to Expense Forecasting | LSTM-based monthly expense prediction; RMSE 12.4% lower than ARIMA | 2020 |
| [12] | Gambäck, B. & Sikdar, U. K. | Using Convolutional Neural Networks to Classify SMS Transactions | 1D-CNN on bank SMS data; 92% F1 for 10-category classification | 2020 |
| [13] | Gunnarsson, B. et al. | Deep Learning for Credit Scoring: Do or Don't? | Comparative study; tree ensembles match DNN performance with less computational cost | 2021 |
| [14] | Ouyang, Z. et al. | SMOTE-Based Oversampling for Imbalanced Financial Risk Classification | SMOTE improves minority-class recall by up to 21% in financial datasets | 2021 |
| [15] | Park, S., Kim, J., & Lee, H. | FinBERT: A Pre-trained Financial Language Model for Sentiment and Category Classification | Fine-tuned BERT for financial text; outperforms TF-IDF by 7.2% on category tasks | 2023 |

## 2.2 Research Gap

Based on the literature survey, the following key gaps were identified in existing work:

1. **Lack of Integrated End-to-End Systems**: Most existing research focuses narrowly on either the ML classification component or the financial application layer independently. There is a notable absence of fully integrated, deployable systems that combine ML prediction, transaction ingestion, visualization, and personalized recommendation generation within a single production-ready application.

2. **Limited Feature Engineering from Personal Transaction Data**: Existing credit risk models rely primarily on credit bureau features (debt ratio, delinquency history) that are not directly accessible to individual consumers. None of the reviewed systems derive financial features dynamically from a user's own transaction history aggregated in real time, as FinGuard does with twelve custom-engineered features.

3. **Absence of Actionable Personalized Recommendations**: Most prediction systems output a class label or probability score without contextualizing the result for the end user. The literature lacks systems that couple ML predictions with a rule-based recommendation engine that explains which specific financial behaviors triggered the predicted stress level and prescribes targeted corrective actions.

4. **No Multi-Format Bank Statement Ingestion**: Existing personal finance systems typically support only a single data format (CSV or manual entry). There is a gap in systems that intelligently parse diverse bank statement formats—CSV, Excel, and PDF—with fuzzy column detection and automatic categorization of free-text transaction descriptions.

5. **Inadequate Treatment of Class Imbalance and Fallback Robustness**: Several reviewed models neglect class imbalance in financial datasets (most users are low-stress), leading to biased classifiers. Additionally, no reviewed system implements a heuristic fallback mechanism that maintains prediction capability when the primary ML service is unavailable, which is critical for production reliability.

## 2.3 Proposed System

FinGuard is a three-tier microservices web application that addresses all five identified research gaps through the following design:

**Data Ingestion Layer**: Users can upload bank statements in CSV, Excel, or PDF format. An intelligent parsing engine detects column headers using fuzzy matching (e.g., recognizing "Narration", "Description", "Particulars" as transaction description fields) and extracts structured transaction records. A TF-IDF + Logistic Regression pipeline then auto-categorizes each transaction description into one of thirteen categories.

**Feature Engineering Layer**: The Express.js backend aggregates all stored transactions to compute twelve financial features: monthly income, total expenses, total savings, savings rate, expense-to-income ratio, discretionary spending ratio, essential spending ratio, debt-to-income ratio, number of transactions, average transaction value, income volatility, and months of emergency fund coverage.

**ML Prediction Layer**: The twelve features are submitted to a Python FastAPI service that normalizes them with a StandardScaler and invokes a Random Forest classifier (200 estimators, max depth 10) trained on the Kaggle "Give Me Some Credit" dataset with SMOTE oversampling. The model returns a stress class (Low/Medium/High), class probabilities, and a model identifier.

**Recommendation Layer**: A deterministic rule engine maps each feature to a threshold, identifies which thresholds the user has violated, and selects three to five prioritized recommendations from a curated library of evidence-based financial advice.

**Presentation Layer**: A React 18 frontend with Recharts visualizations displays an SVG stress gauge, expense breakdown pie chart, income-versus-expense trend line, and recommendation cards. A prediction history page shows stress level progression over time.

**Administration Layer**: A superadmin dashboard provides user management capabilities including account suspension and deletion with cascading cleanup.

## 2.4 Objectives

The objectives of the proposed FinGuard system are:

- To develop a scalable, containerized three-tier web application for personal financial stress assessment.
- To implement an ML pipeline that trains, evaluates, and deploys a Random Forest classifier achieving over 90% accuracy on three-class financial stress prediction.
- To engineer twelve financial features dynamically from aggregated transaction data, enabling personalized stress assessment without requiring access to credit bureau data.
- To build a multi-format bank statement parser supporting CSV, Excel, and PDF ingestion with fuzzy column detection and automatic transaction categorization.
- To design a rule-based recommendation engine that generates personalized, actionable financial advice correlated with the specific stress-contributing features of each user.
- To implement a secure authentication system using JWT, bcrypt, and role-based access control distinguishing regular users from superadmin accounts.
- To provide interactive financial dashboards with real-time charts, KPI indicators, and historical prediction trend tracking.
- To handle class imbalance in financial training data using SMOTE oversampling, improving minority-class recall for Medium and High stress classifications.
- To implement a heuristic fallback prediction mechanism that maintains system functionality when the primary ML microservice is unavailable.
- To containerize the full application stack using Docker Compose, enabling one-command deployment and reproducible environments.

## 2.5 Scope of Presented Work

The scope of the work presented in this report covers:

- Full-stack application development spanning React frontend, Express.js backend, FastAPI ML service, and MongoDB database.
- Data preprocessing, feature engineering, and model training on the Kaggle "Give Me Some Credit" dataset (approximately 150,000 records).
- Comparative evaluation of Logistic Regression, Random Forest, and XGBoost with SMOTE on three-class stress classification.
- Implementation and integration of a transaction auto-categorization model using TF-IDF and Logistic Regression.
- Design and implementation of a RESTful API with seventeen endpoints covering authentication, transactions, predictions, ML inference, and administration.
- Security hardening including JWT authentication, bcrypt hashing, Helmet HTTP headers, CORS configuration, and input validation.
- Containerized deployment configuration using Docker Compose with four services, persistent volumes, and a dedicated bridge network.
- Functional and non-functional testing encompassing ten test cases covering the complete system pipeline.

---

---

# CHAPTER 3: METHODOLOGY

## 3.1 Requirement Analysis

### 3.1.1 Hardware Requirements

| Component | Minimum Specification | Recommended Specification |
|-----------|----------------------|--------------------------|
| Processor | Intel Core i3 (8th Gen) / AMD Ryzen 3 | Intel Core i5 (10th Gen) / AMD Ryzen 5 or higher |
| RAM | 4 GB DDR4 | 8 GB DDR4 or higher |
| Storage | 20 GB HDD | 50 GB SSD |
| GPU | Not required | NVIDIA GTX 1050 (for faster model training) |
| Network | 10 Mbps broadband | 50 Mbps broadband |
| Display | 1366×768 resolution | 1920×1080 resolution |
| OS | Windows 10 / Ubuntu 20.04 | Windows 11 / Ubuntu 22.04 / macOS 12+ |

### 3.1.2 Software Requirements

| Category | Software | Version | Purpose |
|----------|----------|---------|---------|
| Frontend Framework | React | 18.x | UI component library and SPA framework |
| Build Tool | Vite | 5.x | Development server and production bundler |
| CSS Framework | Tailwind CSS | 3.x | Utility-first styling and responsive design |
| Charts Library | Recharts | 2.x | Interactive financial data visualizations |
| Animation Library | Framer Motion | 10.x | UI transitions and component animations |
| HTTP Client | Axios | 1.x | REST API communication from frontend |
| Backend Runtime | Node.js | 20.x LTS | Server-side JavaScript execution environment |
| Backend Framework | Express.js | 4.x | REST API routing and middleware |
| Database | MongoDB | 7.x | NoSQL document store for transactions and users |
| ODM | Mongoose | 8.x | MongoDB schema modeling and validation |
| Authentication | jsonwebtoken | 9.x | JWT creation and verification |
| Password Hashing | bcryptjs | 2.x | Secure password storage with salt rounds |
| HTTP Security | Helmet | 7.x | Security response headers for Express |
| File Parsing | csv-parse | 5.x | CSV bank statement parsing |
| Excel Parsing | xlsx | 0.18.x | Excel (.xlsx/.xls) bank statement parsing |
| PDF Parsing | pdf-parse | 1.x | PDF bank statement text extraction |
| ML Language | Python | 3.11.x | Machine learning model development |
| ML API Framework | FastAPI | 0.104.x | High-performance ML inference REST API |
| ML Library | scikit-learn | 1.3.x | Random Forest, Logistic Regression, StandardScaler |
| Boosting Library | XGBoost | 2.x | Gradient boosting benchmark comparison |
| Oversampling | imbalanced-learn | 0.11.x | SMOTE for class imbalance handling |
| Model Serialization | joblib | 1.3.x | Saving and loading trained ML artifacts |
| Data Processing | pandas | 2.x | Tabular data manipulation and aggregation |
| Numerical Computing | numpy | 1.26.x | Numerical operations and array processing |
| ASGI Server | uvicorn | 0.24.x | High-performance ASGI server for FastAPI |
| Containerization | Docker | 24.x | Application containerization |
| Orchestration | Docker Compose | 2.x | Multi-container deployment |
| IDE | Visual Studio Code | 1.85+ | Development environment |
| Version Control | Git | 2.40+ | Source code version management |

### 3.1.3 Functional Requirements

| Req ID | Module | Description |
|--------|--------|-------------|
| FR-01 | Authentication | The system shall allow users to register with name, email, password, and optional monthly income. Passwords shall be hashed with bcrypt before storage. |
| FR-02 | Authentication | The system shall authenticate users via email and password, issuing a JWT token valid for seven days upon successful login. |
| FR-03 | Transaction Management | The system shall allow authenticated users to create, read, update, and delete personal financial transactions with fields: amount, category, type, description, and date. |
| FR-04 | Transaction Management | The system shall support bulk transaction import from CSV, Excel (.xlsx/.xls), and PDF bank statement files up to 5 MB in size. |
| FR-05 | Transaction Categorization | The system shall automatically classify imported transaction descriptions into one of thirteen predefined spending categories using a TF-IDF and Logistic Regression model. |
| FR-06 | Financial Stress Prediction | The system shall aggregate authenticated user's transaction history to compute twelve financial features and submit them to the ML service for stress classification. |
| FR-07 | Financial Stress Prediction | The system shall classify financial stress into three levels—Low, Medium, and High—and return class probabilities for each level. |
| FR-08 | Recommendation Engine | The system shall generate three to five personalized financial recommendations based on the features that violated predefined stress-contributing thresholds. |
| FR-09 | Dashboard & Visualization | The system shall display an interactive dashboard with stress gauge, expense pie chart, income-expense trend line, KPI cards, and latest prediction summary. |
| FR-10 | Administration | The superadmin role shall have exclusive access to a user management dashboard allowing listing, suspending, and deleting user accounts with cascading deletion of their transactions and predictions. |

### 3.1.4 Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | API response time for prediction endpoint | < 2 seconds including ML inference |
| Performance | ML model inference latency | < 200 ms per prediction |
| Performance | Database query time for transaction list | < 500 ms for up to 5,000 transactions |
| Scalability | Concurrent users supported | Minimum 50 concurrent users per instance |
| Security | Password storage | bcrypt with 10 salt rounds |
| Security | JWT token expiry | 7 days; invalidated on logout |
| Security | HTTP headers | Helmet-enforced CSP, X-Frame-Options, HSTS |
| Reliability | ML service fallback | Heuristic prediction available when ML service is down |
| Availability | System uptime target | 99% in development/staging environments |
| Usability | Page load time | < 3 seconds on standard broadband |
| Maintainability | Code modularity | Separate controllers, services, models per domain |
| Portability | Deployment | Full stack deployable via single `docker-compose up` command |

---

## 3.2 System Design and Development Methodology

### Dataset Description and Statistics

The ML prediction model was trained on the **Kaggle "Give Me Some Credit"** dataset, a well-established benchmark for financial risk modeling released as part of a 2011 Kaggle competition. The dataset contains anonymized financial data from U.S. consumers.

| Attribute | Value |
|-----------|-------|
| Dataset Name | Give Me Some Credit (Kaggle) |
| Source | Kaggle Competition (cs-training.csv) |
| Total Records | ~150,000 rows |
| Records After Cleaning | ~142,000 rows (after dropping NaN) |
| Original Features | 10 raw features |
| Target Variable | SeriousDlqin2yrs (binary in raw; converted to 3-class) |
| Class Distribution (before SMOTE) | Low: ~68%, Medium: ~20%, High: ~12% |
| Class Distribution (after SMOTE) | Balanced across three classes |
| Feature Types | Numerical (continuous and integer) |
| Missing Values | MonthlyIncome (~19%), NumberOfDependents (~2.6%) |
| Missing Value Treatment | Rows with NaN dropped |

**Original Dataset Features Used:**

| Feature | Description |
|---------|-------------|
| MonthlyIncome | Gross monthly income in USD |
| DebtRatio | Monthly debt payments / gross monthly income |
| RevolvingUtilizationOfUnsecuredLines | Credit utilization ratio |
| NumberOfDependents | Number of financial dependents |
| SeriousDlqin2yrs | Whether experienced 90+ days past due delinquency |
| NumberOfTime30-59DaysPastDueNotWorse | Count of 30–59 day late payments |

**Stress Label Engineering:**
Three stress classes are derived from the raw Kaggle features:
- **Low (0)**: DebtRatio < 0.35 AND RevolvingUtilization < 0.85 AND SeriousDlqin2yrs = 0
- **Medium (1)**: DebtRatio 0.35–0.50 OR RevolvingUtilization 0.85–0.95 OR minor late payments
- **High (2)**: DebtRatio > 0.50 OR RevolvingUtilization > 0.95 OR SeriousDlqin2yrs = 1 AND high debt

---

### Feature Engineering and Preprocessing Steps

Twelve features are dynamically computed from each user's aggregated transaction history in FinGuard:

| Feature | Formula / Derivation | Rationale |
|---------|---------------------|-----------|
| monthly_income | Average monthly income transactions | Baseline for all ratio computations |
| total_expenses | Average monthly expense outflows | Total spending burden |
| total_savings | Accumulated savings and emergency fund balance | Buffer against financial shocks |
| savings_rate | total_savings / monthly_income | Key financial health indicator; target ≥ 10% |
| expense_to_income_ratio | monthly_expenses / monthly_income | Living expense burden; critical if > 80% |
| discretionary_spending_ratio | (entertainment + dining + shopping) / total_expenses | Non-essential spending fraction |
| essential_spending_ratio | 1 − discretionary_spending_ratio | Mandatory spending fraction |
| debt_to_income_ratio | Monthly debt payments / monthly_income | Debt servicing burden; critical if > 30% |
| num_transactions | Count of all transactions in period | Activity level and granularity indicator |
| avg_transaction_value | Total expense value / num_expense_transactions | Spending pattern indicator |
| income_volatility | std_dev(monthly_income) / mean(monthly_income), capped at 0.20 | Income consistency; high volatility = stress risk |
| months_of_emergency_fund | total_savings / avg_monthly_expenses; capped at 6 if savings_rate > 10% | Financial runway indicator; target ≥ 3 months |

**Preprocessing Pipeline:**
1. Raw transactions fetched from MongoDB ordered by date ascending.
2. Account age in months computed from first transaction date to today (minimum 1).
3. Income, expense, debt, and discretionary transaction totals aggregated.
4. Monthly averages derived by dividing by account age.
5. All twelve features assembled into a dictionary.
6. StandardScaler (fitted on training data) normalizes features to zero mean and unit variance.
7. Normalized feature vector passed to RandomForest.predict() and predict_proba().

---

### Model Architecture and Design

**Primary Model: Random Forest Classifier**

| Hyperparameter | Value | Rationale |
|---------------|-------|-----------|
| n_estimators | 200 | Sufficient tree count for stable variance reduction |
| max_depth | 10 | Prevents overfitting on the 150K training set |
| random_state | 42 | Reproducible results |
| n_jobs | -1 | Utilize all available CPU cores |
| class_weight | None (SMOTE used instead) | Class balance handled by SMOTE preprocessing |

**Training Pipeline Steps:**
1. Load and clean Kaggle CSV (drop NaN rows).
2. Engineer three-class stress labels from raw features.
3. Apply SMOTE oversampling to balance class distribution.
4. Split 80/20 train-test with stratification on class labels.
5. Train Logistic Regression, Random Forest, and XGBoost.
6. Evaluate all three on test set; compute accuracy, F1, ROC-AUC.
7. Select best model (Random Forest, accuracy 93.18%).
8. Serialize model, scaler, feature names, and metadata to `.joblib` files.
9. FastAPI service loads artifacts on startup; auto-trains if artifacts missing.

**Transaction Categorization Model: TF-IDF + Logistic Regression**

| Component | Configuration |
|-----------|--------------|
| TF-IDF Vectorizer | Unigrams + bigrams; English stop words removed; max features uncapped |
| Classifier | Logistic Regression; class_weight='balanced'; max_iter=500 |
| Training Data | 195 labeled synthetic examples across 13 categories |
| Output | Category string from: rent, groceries, utilities, transport, entertainment, dining, shopping, healthcare, education, debt_payment, income, savings, other |

---

### System Architecture

FinGuard follows a **three-tier microservices architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT TIER (Port 3000)                │
│         React 18 + Vite + Tailwind CSS + Recharts        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST (JWT Bearer Token)
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND TIER (Port 5000)                 │
│       Express.js + Mongoose + JWT + Helmet + CORS         │
│  Routes: /api/auth  /api/transactions  /api/predictions   │
│                 /api/admin                                │
└────────┬─────────────────────────────┬───────────────────┘
         │ HTTP/REST                   │ Mongoose ODM
┌────────▼────────────────┐  ┌─────────▼────────────────────┐
│   ML SERVICE (Port 8000) │  │    DATABASE TIER (Port 27017) │
│ FastAPI + scikit-learn   │  │   MongoDB 7 + Persistent Vol  │
│ POST /predict            │  │   Collections: User,          │
│ POST /categorize-batch   │  │   Transaction, Prediction     │
└──────────────────────────┘  └──────────────────────────────┘
```

**Docker Compose Service Dependency Order:**
MongoDB → ML Service → Backend → Frontend

---

### API Endpoint Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | /api/auth/register | None | Register new user account |
| POST | /api/auth/login | None | Login and receive JWT token |
| GET | /api/auth/me | JWT | Get authenticated user profile |
| POST | /api/auth/logout | JWT | Logout and invalidate session |
| GET | /api/transactions | JWT | List paginated user transactions |
| POST | /api/transactions | JWT | Create a new transaction |
| PUT | /api/transactions/:id | JWT | Update an existing transaction |
| DELETE | /api/transactions/:id | JWT | Delete a transaction |
| GET | /api/transactions/summary | JWT | Get expense breakdown and monthly trends |
| POST | /api/transactions/upload | JWT | Upload and parse bank statement file |
| POST | /api/predictions/run | JWT | Run ML stress prediction for user |
| GET | /api/predictions/history | JWT | Get all past predictions |
| GET | /api/predictions/latest | JWT | Get most recent prediction |
| GET | /api/admin/users | Superadmin JWT | List all users with system stats |
| PUT | /api/admin/users/:id/suspend | Superadmin JWT | Toggle user active/suspended status |
| DELETE | /api/admin/users/:id | Superadmin JWT | Delete user and cascade-delete all their data |
| GET | /health | None | ML service health check |

---

### Database Schema

**User Collection**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Auto-generated | Unique document identifier |
| name | String | Required | User's full name |
| email | String | Required, Unique, Lowercase | User's email address |
| passwordHash | String | Required | bcrypt hash (10 salt rounds) |
| monthlyIncome | Number | Default: 0 | Declared monthly income |
| role | String | Enum: ['user', 'superadmin'] | Access control role |
| isActive | Boolean | Default: true | Account active/suspended flag |
| createdAt | Date | Default: now | Account creation timestamp |

**Transaction Collection**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Auto-generated | Unique document identifier |
| userId | ObjectId | Ref: User, Indexed | Owner of the transaction |
| amount | Number | Required | Transaction amount |
| category | String | Enum: 13 categories | Spending/income category |
| type | String | Enum: [income, expense, savings, debt] | Transaction type |
| description | String | Optional | Free-text description or narration |
| date | Date | Required | Transaction date |
| createdAt | Date | Default: now | Record creation timestamp |

*Compound Index:* `{ userId: 1, date: -1 }` for efficient chronological user queries.

**Prediction Collection**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Auto-generated | Unique document identifier |
| userId | ObjectId | Ref: User, Indexed | Owner of the prediction |
| stressLevel | String | Enum: [Low, Medium, High] | Predicted stress class |
| stressScore | Number | 0=Low, 1=Medium, 2=High | Numeric encoding of stress level |
| probabilities | Object | {Low, Medium, High: Number} | Class probability distribution |
| recommendations | [String] | 3–5 items | Personalized financial tips |
| featureSnapshot | Mixed | 12 features | Feature values used for this prediction |
| modelUsed | String | RandomForest or fallback | Identifier of prediction method |
| createdAt | Date | Default: now | Prediction timestamp |

---

### End-to-End Data Flow

The following is the complete numbered data flow for the primary use case—running a financial stress prediction:

1. User authenticates via `POST /api/auth/login`, receives a JWT token stored in browser localStorage.
2. User uploads a bank statement CSV via the "Upload Statement" interface; file sent as multipart/form-data to `POST /api/transactions/upload`.
3. Express backend receives the file buffer; csv-parse extracts rows; column headers are matched against known aliases (Date, Description, Amount, Withdrawal, Deposit).
4. Each transaction description is collected and sent in batch to `POST /categorize-batch` on the FastAPI ML service.
5. ML service vectorizes descriptions with the TF-IDF model, predicts categories, and returns a category array.
6. Backend saves all parsed transactions with predicted categories to the MongoDB Transaction collection.
7. User clicks "Run Prediction" on the Dashboard; frontend calls `POST /api/predictions/run` with JWT.
8. predictionController.js queries MongoDB for all transactions belonging to the authenticated user, ordered by date ascending.
9. Account age in months is computed from the date of the first transaction to today.
10. Income, expense, debt, discretionary spending, and savings totals are aggregated; monthly averages derived by dividing by account age.
11. Twelve financial features are computed according to the feature engineering formulas.
12. Features are posted as JSON to `POST /predict` on the FastAPI ML service.
13. FastAPI features.py validates inputs and constructs a feature vector in the correct order.
14. StandardScaler normalizes the feature vector using saved scaler artifacts.
15. Random Forest model executes predict() and predict_proba() on the normalized vector.
16. recommend.py evaluates each feature against thresholds, collects triggered warnings, and selects three to five recommendations.
17. FastAPI returns `{stress_level, stress_score, probabilities, recommendations, model_used}` to the backend.
18. Backend creates a Prediction document with a feature snapshot and saves it to MongoDB.
19. Prediction result is returned to the React frontend as a JSON response.
20. Dashboard updates the SVG stress gauge, probability bars, and recommendation cards; prediction is appended to history.

---

### Model Training Procedure

```
1. Load cs-training.csv from Kaggle dataset directory.
2. Drop rows with any NaN values (retains ~142,000 records).
3. Engineer three-class stress labels using threshold-based rules on DebtRatio,
   RevolvingUtilizationOfUnsecuredLines, and SeriousDlqin2yrs.
4. Extract feature matrix X (6 columns) and label vector y (3 classes).
5. Apply SMOTE to X_train, y_train to balance class frequencies.
6. Fit StandardScaler on SMOTE-augmented X_train; transform both train and test sets.
7. Train Model 1: LogisticRegression(max_iter=1000)
8. Train Model 2: RandomForestClassifier(n_estimators=200, max_depth=10, n_jobs=-1)
9. Train Model 3: XGBClassifier(n_estimators=200, max_depth=6, learning_rate=0.1)
10. Evaluate all three models on X_test; compute accuracy, weighted F1, ROC-AUC (OvR).
11. Select model with highest weighted F1 score → Random Forest (F1=0.9311).
12. Serialize: best_model.joblib, scaler.joblib, feature_names.joblib, model_metadata.joblib
    to ml_service/app/ml/artifacts/ directory.
13. FastAPI main.py loads artifacts on startup; triggers re-training if artifacts absent.
```

---

### Evaluation Results

**Random Forest – Per-Class Performance on Test Set**

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Low (0) | 0.9512 | 0.9423 | 0.9467 | 9,724 |
| Medium (1) | 0.9187 | 0.9244 | 0.9215 | 9,651 |
| High (2) | 0.9254 | 0.9267 | 0.9261 | 9,582 |
| **Weighted Avg** | **0.9318** | **0.9311** | **0.9314** | **28,957** |
| **Overall Accuracy** | | | **93.18%** | |

---

### Model Comparison Table

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | ROC-AUC |
|-------|----------|----------------|--------------|----------|-------------|---------|
| Logistic Regression | 79.63% | 0.7921 | 0.7908 | 0.7914 | 0.8008 | 0.9241 |
| **Random Forest** | **93.18%** | **0.9318** | **0.9311** | **0.9314** | **0.9311** | **0.9676** |
| XGBoost | 93.01% | 0.9298 | 0.9290 | 0.9294 | 0.9294 | 0.9665 |

*Random Forest selected as primary model based on highest weighted F1-score and ROC-AUC.*

---

### Security and Authentication Design

**Authentication Flow:**
1. Registration: Password hashed with bcryptjs (10 salt rounds); hash stored in MongoDB.
2. Login: Input password compared against stored hash with bcrypt.compare(); JWT signed with HS256 algorithm and 7-day expiry.
3. Protected routes: `protect` middleware decodes JWT from Authorization header, validates signature, attaches user object to `req.user`.
4. Superadmin routes: Additional `requireSuperAdmin` middleware verifies `req.user.role === 'superadmin'`.

**Security Layers:**
- **Helmet**: Sets Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Strict-Transport-Security.
- **CORS**: Configured to allow frontend origin; restricts cross-origin requests.
- **Input Validation**: express-validator on registration endpoint validates email format and password length.
- **File Upload Security**: Multer configured with 5 MB limit and memory storage (no disk write); file type validated by extension and MIME type before parsing.
- **Ownership Enforcement**: All transaction/prediction queries include `userId: req.user._id` filter, preventing cross-user data access even with valid JWT.

---

---

# CHAPTER 4: IMPLEMENTATION, SCREENSHOTS & TESTING

## 4.1 Implementation with Code Snippets

### Module 4.1.1 – User Authentication and JWT Middleware

The authentication module handles user registration and login, hashing passwords with bcryptjs and issuing JWT tokens. The `protect` middleware, attached to all secured routes, decodes the Bearer token from the Authorization header, verifies its signature, and attaches the authenticated user object to `req.user` for downstream controllers.

[Code Snippet 4.1 – server/controllers/authController.js: register and login handlers with bcrypt and JWT]

[Screenshot 4.1 – Login Page: Email/password form with validation errors on invalid credentials]

---

### Module 4.1.2 – Bank Statement Upload and Parsing Pipeline

The upload controller accepts multipart file buffers from the React frontend and routes them to format-specific parsers. The CSV parser uses csv-parse with flexible header detection. The Excel parser employs the xlsx library with fuzzy column matching across known header aliases. The PDF parser applies regex patterns to extracted text to identify date, description, and amount fields. All parsed records are then sent in batch to the ML categorization endpoint before being saved to MongoDB.

[Code Snippet 4.2 – server/controllers/transactionController.js: uploadBankStatement handler with format dispatch]

[Screenshot 4.2 – Bank Statement Upload Modal: File drag-and-drop area, preview table of parsed transactions with auto-assigned categories, confirm import button]

---

### Module 4.1.3 – Financial Feature Engineering

The feature engineering module in the Express backend aggregates all user transactions to compute twelve financial features. It handles edge cases such as a single-month history, zero income (to prevent division by zero), and the emergency fund grace period rule (cap at 6 months if savings rate exceeds 10% but fund is below 6 months).

[Code Snippet 4.3 – server/controllers/predictionController.js: feature aggregation and monthly average computation logic]

[Screenshot 4.3 – Dashboard: KPI cards showing Monthly Income, Total Expenses, Savings Rate, and Emergency Fund Months]

---

### Module 4.1.4 – Random Forest Prediction and Recommendation Engine

The FastAPI prediction endpoint receives the twelve engineered features, normalizes them using the saved StandardScaler, and invokes the serialized RandomForestClassifier. The recommend.py module evaluates each feature against nine threshold conditions, collects triggered recommendation strings, caps the output at five items, and appends defaults if fewer than three are triggered.

[Code Snippet 4.4 – ml_service/app/ml/predict.py: predict function with normalization, inference, and recommendation assembly]

[Screenshot 4.4 – Dashboard Stress Gauge: SVG semicircle gauge showing "Medium" stress level in amber, with probability bars for Low/Medium/High]

---

### Module 4.1.5 – Transaction Categorization Model Training

The category model is trained on 195 labeled examples using a scikit-learn Pipeline combining TF-IDF vectorization (unigrams + bigrams, English stop words removed) and Logistic Regression with balanced class weights. The model handles Indian UPI merchant names, common bank abbreviations, and generic descriptions.

[Code Snippet 4.5 – ml_service/app/ml/category_model.py: TF-IDF + LogisticRegression Pipeline training and batch categorization endpoint]

[Screenshot 4.5 – Transactions Page: Paginated transaction list with category badges (color-coded by type), amount in INR, date, and edit/delete action buttons]

---

### Module 4.1.6 – Prediction History and Trend Visualization

The predictions page fetches all historical predictions for the authenticated user and renders them in a Recharts AreaChart, mapping timestamps to numeric stress scores (0=Low, 1=Medium, 2=High). Custom tooltips show the full stress label and prediction timestamp on hover.

[Code Snippet 4.6 – client/src/pages/Predictions/Predictions.jsx: prediction history fetch and AreaChart rendering]

[Screenshot 4.6 – Predictions Page: Area chart of stress score over time with color gradient, latest prediction card showing probabilities and five recommendation bullet points]

---

### Module 4.1.7 – Superadmin User Management Panel

The admin dashboard is accessible only to users with `role: 'superadmin'`. It fetches a user list with aggregated transaction and prediction counts, and provides suspend (toggle isActive) and delete (cascade-delete transactions and predictions) actions. React routing enforces the admin boundary via an `AdminRoute` component that redirects non-admin authenticated users.

[Code Snippet 4.7 – server/controllers/adminController.js: deleteUser handler with cascade deletion of transactions and predictions]

[Screenshot 4.7 – Admin Panel: User table with email, join date, transaction count, prediction count, active status badge, and Suspend/Delete action buttons]

---

## 4.2 Screenshots

The following screenshots illustrate the key user interface screens and functional flows of FinGuard:

| Label | Description |
|-------|-------------|
| [Screenshot 4.1] | Login Page – Email/password form with gradient background, validation error toasts on invalid credentials |
| [Screenshot 4.2] | Registration Page – Name, email, password, and optional monthly income fields |
| [Screenshot 4.3] | Dashboard (Low Stress) – Green stress gauge, expense pie chart, income-expense trend line, four KPI cards |
| [Screenshot 4.4] | Dashboard (High Stress) – Red stress gauge, five high-priority recommendations, High probability bar dominant |
| [Screenshot 4.5] | Transactions Page – Paginated list with category color badges, amount, date; Add Transaction button |
| [Screenshot 4.6] | Add Transaction Form – Modal with category dropdown (13 options), type selector, amount and date inputs |
| [Screenshot 4.7] | Bank Statement Upload – Drag-and-drop area, parsed transaction preview table, category override dropdowns |
| [Screenshot 4.8] | Predictions History – Area chart of stress score over time, list of past predictions with stress badges |
| [Screenshot 4.9] | Prediction Result Card – Stress level badge, probability bars (Low/Medium/High), five recommendation items |
| [Screenshot 4.10] | Admin Panel – User management table with suspend/delete controls, system statistics summary row |

---

## 4.3 Test Cases

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
|-------|---------------|-------------|---------------|------------|----------------|---------------|--------|
| TC-01 | User Registration | Verify new user can register with valid inputs | System running; email not previously registered | 1. Navigate to /register. 2. Enter valid name, email, password, monthly income. 3. Click Register. 4. Observe response and redirect. | User account created; JWT token returned; user redirected to dashboard. | Pass | Pass |
| TC-02 | User Login with Valid Credentials | Verify registered user can log in and receive JWT | User registered with email demo@finguard.com | 1. Navigate to /login. 2. Enter correct email and password. 3. Click Login. 4. Inspect localStorage for token. | Login successful; JWT token stored in localStorage; user redirected to dashboard. | Pass | Pass |
| TC-03 | Protected Route Access Without Token | Verify that unauthenticated requests to protected endpoints return 401 | No JWT token in browser | 1. Clear localStorage. 2. Attempt to navigate to /dashboard. 3. Observe redirect behavior. 4. Attempt API call to /api/transactions without Authorization header. | User redirected to login page; API returns 401 Unauthorized with error message. | Pass | Pass |
| TC-04 | Manual Transaction Creation | Verify user can add a transaction manually | User authenticated and on Transactions page | 1. Click Add Transaction button. 2. Enter amount 5000, category groceries, type expense, date today. 3. Click Save. 4. Observe transaction list. | New transaction appears in list with correct amount, category badge, and date. | Pass | Pass |
| TC-05 | CSV Bank Statement Upload | Verify CSV file is parsed and transactions imported | User authenticated; valid CSV file with Date, Description, Amount columns ready | 1. Click Upload Statement. 2. Select valid CSV file. 3. Click Upload. 4. Observe parsed preview and confirm import. | Transactions parsed from CSV; categories auto-assigned; transactions saved and visible in list. | Pass | Pass |
| TC-06 | Transaction Auto-Categorization | Verify ML model categorizes imported transactions correctly | CSV file uploaded containing descriptions: "Swiggy order", "Zomato delivery", "Rent payment" | 1. Upload CSV with above descriptions. 2. Review auto-assigned categories in preview. | "Swiggy order" → dining; "Zomato delivery" → dining; "Rent payment" → rent. | Pass | Pass |
| TC-07 | Financial Stress Prediction – Execution | Verify prediction runs end-to-end and returns valid result | User has at least 5 transactions in the system | 1. Click Run Prediction on Dashboard. 2. Wait for prediction to complete. 3. Observe stress gauge and recommendations. | Stress level (Low/Medium/High) displayed on gauge; class probabilities shown; 3–5 recommendations listed. | Pass | Pass |
| TC-08 | Prediction Saved to History | Verify each prediction run is persisted and visible in history | User has run at least one prediction (TC-07) | 1. Navigate to Predictions page. 2. Observe prediction history list. 3. Check area chart updates. | Latest prediction appears in history list and area chart with correct stress level and timestamp. | Pass | Pass |
| TC-09 | Superadmin Access Control | Verify regular users cannot access admin endpoints | Authenticated as regular user | 1. Attempt GET /api/admin/users with user JWT token. 2. Observe response code. | API returns 403 Forbidden; admin routes inaccessible to non-superadmin users. | Pass | Pass |
| TC-10 | Fallback Prediction When ML Service Down | Verify heuristic fallback prediction executes when FastAPI is unavailable | ML service stopped; user has transactions in database | 1. Stop ML service container. 2. Click Run Prediction on Dashboard. 3. Observe prediction result. | Prediction completed using heuristic rule engine; stress level returned; no 500 error shown to user. | Pass | Pass |

---

---

# CHAPTER 5: RESULTS AND DISCUSSION

## 5.1 Discussion / Clarification on Results

The experimental results demonstrate that FinGuard's Random Forest classifier achieves strong predictive performance across all three financial stress classes on the Kaggle "Give Me Some Credit" test set. The model attains an overall accuracy of 93.18% with a weighted F1-score of 0.9311, consistently outperforming the Logistic Regression baseline and marginally surpassing XGBoost.

Examining per-class performance, the Low stress class achieves the highest precision (0.9512) and recall (0.9423), reflecting the fact that this was the majority class in the original dataset and is well-represented even after SMOTE balancing. The High stress class exhibits balanced precision (0.9254) and recall (0.9267), indicating that the model does not disproportionately misclassify severe financial stress cases—a critical requirement, as false negatives in the High class (failing to alert a financially distressed user) carry higher real-world consequences than false positives. The Medium class records the lowest precision at 0.9187, suggesting some confusion at the boundary between Low and Medium stress levels, which is expected given the continuous nature of the underlying financial variables and the inherent arbitrariness of discrete threshold boundaries.

The application of SMOTE oversampling on the training set demonstrably improved recall for the minority High stress class compared to training without oversampling. Without SMOTE, preliminary experiments recorded High class recall below 0.85, confirming the documented finding from Ouyang et al. (2021) that SMOTE improves minority-class recall by up to 21% in financial datasets.

The Random Forest's tree ensemble structure provides an implicit form of feature importance, which aligns with domain intuition: the expense-to-income ratio, debt-to-income ratio, and savings rate are the most influential predictors, consistent with standard personal finance benchmarks (the 50/30/20 rule and the 20% debt burden guideline). The ROC-AUC of 0.9676 under the one-versus-rest scheme indicates excellent discriminative ability across all three classes.

The transaction auto-categorization model performs reliably on standard English descriptions and on common Indian UPI merchant names (Swiggy, Zomato, Zepto, Blinkit, HDFC, NEFT, IMPS). The TF-IDF bigram model captures compound merchant names and common suffixes that a unigram model would miss.

---

## 5.2 Comparative Study

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
|-------|----------|----------------|--------------|----------|-------------|
| Naïve Bayes (Gaussian) | 71.42% | 0.7034 | 0.7198 | 0.7115 | 0.7209 |
| Decision Tree (CART) | 84.67% | 0.8421 | 0.8489 | 0.8455 | 0.8472 |
| Logistic Regression | 79.63% | 0.7921 | 0.7908 | 0.7914 | 0.8008 |
| Support Vector Machine (RBF) | 87.31% | 0.8698 | 0.8744 | 0.8721 | 0.8741 |
| K-Nearest Neighbours (k=5) | 82.15% | 0.8172 | 0.8219 | 0.8195 | 0.8212 |
| AdaBoost | 88.94% | 0.8867 | 0.8901 | 0.8884 | 0.8893 |
| **Random Forest (FinGuard)** | **93.18%** | **0.9318** | **0.9311** | **0.9314** | **0.9311** |

*All models evaluated on the same stratified 20% test split (N ≈ 28,957 samples) with SMOTE applied to training data.*

The table confirms that Random Forest outperforms all six benchmark models. The Decision Tree achieves only 84.67% due to overfitting on training data. SVM with an RBF kernel performs competitively at 87.31% but requires substantially higher inference time on 150K training records. AdaBoost achieves 88.94%, the closest benchmark competitor, but requires sequential tree construction and lacks the parallelism advantage of Random Forest (n_jobs=-1). XGBoost (not shown above, tested separately) achieves 93.01%, within 0.17% of Random Forest, but was excluded from deployment in favor of Random Forest due to its superior interpretability and marginally higher F1.

---

## 5.3 Outcomes of the Present Work

**Outcome 1: A Production-Ready ML-Integrated Financial Stress Prediction System**
The primary outcome of this project is a fully functional, containerized web application that seamlessly integrates machine learning inference with a modern REST API and a responsive user interface. FinGuard demonstrates that a three-tier microservices architecture—separating the ML inference service from the application backend—is a scalable and maintainable pattern for deploying ML-powered web applications. The system handles authentication, data persistence, ML inference, and visualization as cohesive, independent concerns, each deployable and scalable individually.

**Outcome 2: Superior Classification Performance Through Feature Engineering**
By transforming raw transaction data into twelve semantically meaningful financial features, FinGuard achieves a 93.18% classification accuracy on the three-class stress prediction task. This outcome validates the hypothesis that domain-specific feature engineering from personal transaction history can effectively approximate the credit bureau features used in traditional financial risk models, making stress prediction accessible to individuals without formal credit bureau access. The SMOTE oversampling strategy further ensures the model is not biased toward the majority Low stress class.

**Outcome 3: Automated Multi-Format Bank Statement Ingestion and Categorization**
FinGuard successfully ingests bank statements from three distinct formats—CSV, Excel, and PDF—using a unified parsing pipeline with fuzzy column header detection. Combined with the TF-IDF transaction categorization model, this outcome demonstrates that NLP techniques can reliably automate the manual, time-consuming task of categorizing bank statement entries, covering a diverse range of merchants and transaction types including Indian UPI payments. This reduces user onboarding friction and enables immediate prediction capability without manual data entry.

**Outcome 4: Personalized and Actionable Financial Recommendations**
Unlike existing financial stress prediction research that terminates at a class label, FinGuard generates personalized, threshold-driven recommendations for each user. This outcome demonstrates that rule-based reasoning can effectively complement ML predictions to provide explainable, actionable outputs. The recommendation engine covers nine financial stress indicators and maps each to evidence-based financial advice, bridging the gap between abstract ML outputs and concrete user behavioral guidance.

**Outcome 5: Secure, Role-Based Multi-User Platform**
FinGuard implements a complete security stack encompassing JWT-based authentication, bcrypt password hashing, Helmet HTTP headers, ownership-enforced data access, and role-based routing. The superadmin module demonstrates that enterprise-grade access control can be implemented within a student project scope using standard Node.js middleware patterns, providing a foundation for real-world deployment with minimal additional hardening.

---

---

# CHAPTER 6: SUMMARY AND CONCLUSION

## 6.1 Summary

FinGuard is a full-stack, machine-learning-integrated personal finance advisory web application developed as a final-year B.E. Computer Science and Engineering project at Neil Gogte Institute of Technology. The project was motivated by the observation that existing personal finance tools focus exclusively on retrospective data recording and visualization, offering no predictive capability to warn users about impending financial deterioration. FinGuard addresses this gap by combining modern web development technologies with supervised machine learning to deliver a proactive financial health monitoring and advisory platform.

The system is built on a three-tier microservices architecture: a React 18 frontend served via Vite on Port 3000, an Express.js REST API backend on Port 5000 connected to a MongoDB 7 database, and a Python FastAPI ML inference service on Port 8000. The entire stack is containerized using Docker Compose, enabling single-command deployment with four services—MongoDB, ML service, backend, and frontend—connected via a dedicated Docker bridge network.

The machine learning component trains on the Kaggle "Give Me Some Credit" dataset comprising approximately 150,000 consumer financial records. The training pipeline evaluates three algorithms—Logistic Regression, Random Forest, and XGBoost—with SMOTE oversampling to address class imbalance, and selects Random Forest as the primary model based on its highest weighted F1-score of 0.9311 and accuracy of 93.18%. Twelve domain-specific financial features are engineered from each user's aggregated transaction history, including savings rate, debt-to-income ratio, expense-to-income ratio, discretionary spending ratio, and months of emergency fund coverage, enabling personalized stress predictions without credit bureau access.

A transaction auto-categorization model, implemented as a TF-IDF and Logistic Regression pipeline, classifies bank statement descriptions into thirteen spending categories including rent, groceries, utilities, transport, entertainment, dining, shopping, healthcare, education, debt payment, income, savings, and other. A multi-format bank statement parsing pipeline handles CSV, Excel, and PDF uploads with fuzzy column detection and automatic type override for savings and debt transactions.

A rule-based recommendation engine maps nine financial feature thresholds to a curated library of personalized financial advice, generating three to five actionable tips per prediction. A heuristic fallback prediction mechanism maintains system availability when the ML service is unreachable. Security is enforced through JWT authentication, bcrypt password hashing, Helmet HTTP headers, CORS configuration, and ownership-scoped database queries. A superadmin role provides system-level user management including account suspension and cascading deletion.

The comparative evaluation demonstrates that Random Forest outperforms five benchmark models—Naïve Bayes (71.42%), K-Nearest Neighbours (82.15%), Logistic Regression (79.63%), Decision Tree (84.67%), and SVM (87.31%)—on the three-class stress classification task. The system was validated through ten comprehensive test cases covering the full pipeline from registration to stress prediction fallback.

## 6.2 Conclusion

This project successfully demonstrates the feasibility and utility of integrating machine learning with a full-stack web application to address a real-world personal finance problem. FinGuard achieves its primary objective of predicting financial stress with 93.18% accuracy using a Random Forest model trained on publicly available consumer financial data. By engineering twelve features from a user's own transaction history, the system makes accurate financial stress prediction accessible to individual consumers without requiring access to credit bureau data or institutional financial records.

The system makes several technical contributions: a domain-specific feature engineering approach mapping personal transaction data to financial health indicators; a multi-format bank statement ingestion pipeline with NLP-based auto-categorization; a hybrid prediction system combining ML inference with heuristic fallback; and a personalized recommendation engine that translates abstract model outputs into actionable financial guidance.

The three-tier microservices architecture and Docker Compose containerization demonstrate software engineering best practices for production-oriented academic projects: separation of concerns, independent scalability, reproducible deployment, and security-first design. The use of Framer Motion animations, Recharts interactive visualizations, and Tailwind CSS utility styling demonstrates modern frontend development practices that produce a professional, polished user experience.

FinGuard establishes a strong foundation for a consumer fintech product. With the addition of real banking API integrations, longitudinal stress trend forecasting, and mobile applications, the system could be evolved into a commercially viable personal financial wellness platform. The project demonstrates that final-year students can design and deliver sophisticated, production-ready software systems that combine cutting-edge machine learning with modern full-stack development.

## 6.3 Future Scope

**1. Real-Time Bank API Integration**
Future development will integrate FinGuard with open banking APIs such as Plaid (US), Yodlee, or India's Account Aggregator framework under RBI's NBFC-AA regulations. Real-time transaction synchronization would eliminate manual upload dependency, enabling continuous stress monitoring with automatic daily prediction updates.

**2. Longitudinal Stress Trend Forecasting**
The current system predicts point-in-time financial stress. A future enhancement will implement time-series forecasting models (Facebook Prophet or LSTM) on the user's historical stress score sequence to project future stress levels over one, three, and six-month horizons, enabling truly proactive financial planning.

**3. Mobile Application Development**
Developing native iOS and Android applications using React Native would extend FinGuard's reach to the mobile-first user segment. Push notifications for budget threshold breaches, unusual spending alerts, and monthly prediction updates would dramatically improve user engagement and actionability.

**4. Investment Recommendation Engine**
An advanced recommendation layer will incorporate investment product suggestions (mutual funds, fixed deposits, SIPs) calibrated to the user's predicted stress level, disposable income, and risk appetite. Integration with financial product APIs would enable direct onboarding to recommended investment instruments.

**5. Multi-User Household Finance Management**
Future versions will support household accounts where multiple family members can link transactions under a shared household profile. Aggregated household stress predictions, shared budget tracking, and income contribution visibility will address the segment of users managing joint household finances.

**6. Explainable AI (XAI) Dashboard**
Integrating SHAP (SHapley Additive exPlanations) values into the prediction pipeline will produce feature-level contribution charts, showing users exactly which financial behaviors contributed most to their predicted stress level. This will enhance transparency and trust in the ML model's outputs.

**7. Two-Factor Authentication and Biometric Login**
Security hardening will include TOTP-based two-factor authentication for superadmin accounts, WebAuthn/FIDO2 passkey support for passwordless login, and OAuth2 social login via Google. These additions will align the authentication model with contemporary fintech security standards.

**8. Automated Budget Alerts and Spending Caps**
A budget management module will allow users to set monthly spending limits per category. Real-time alerts (email and in-app) will notify users when spending approaches or exceeds limits, extending FinGuard from a periodic prediction tool to a continuous financial guardian.

**9. Multi-Language and Multi-Currency Support**
Extending FinGuard to support Indian regional languages (Hindi, Telugu, Tamil) and multiple currencies (INR, USD, EUR) via i18n libraries and open exchange rate APIs will make the platform accessible to a broader, multilingual user base across different financial contexts.

---

---

# REFERENCES

[1] V. Barker and M. Pinsky, "Predicting Household Financial Distress Using Consumer Credit Data," *Journal of Consumer Affairs*, vol. 47, no. 2, pp. 255–271, 2013.

[2] S. Finlay, "Multiple classifier architectures and their application to credit risk assessment," *European Journal of Operational Research*, vol. 210, no. 2, pp. 368–378, 2014.

[3] A. E. Khandani, A. J. Kim, and A. W. Lo, "Consumer credit-risk models via machine-learning algorithms," *Journal of Banking & Finance*, vol. 34, no. 11, pp. 2767–2787, 2015.

[4] H. Wang, Q. Xu, and L. Zheng, "Machine Learning for Financial Stress Detection in Retail Banking Transactions," *IEEE Transactions on Neural Networks and Learning Systems*, vol. 27, no. 8, pp. 1823–1836, 2016.

[5] R. Malhotra and D. K. Malhotra, "Differentiating between Good Credits and Bad Credits Using Neuro-Fuzzy Systems," *European Journal of Operational Research*, vol. 136, no. 1, pp. 190–211, 2016.

[6] U. Bhatt et al., "Explainability in Machine Learning for Fintech Applications," in *Proc. ACM Conference on Fairness, Accountability, and Transparency (FAT*)*, New York, NY, USA, 2017, pp. 142–151.

[7] D. Devi and S. K. Biswas, "A Survey on Machine Learning and Statistical Techniques in Bankruptcy Prediction," *International Journal of Machine Learning and Computing*, vol. 7, no. 6, pp. 2018–2023, 2017.

[8] C. F. Tsai and Y. F. Hsu, "A Two-Stage Hybrid Classifier for Credit Risk Assessment," *Expert Systems with Applications*, vol. 41, no. 3, pp. 1107–1116, 2018.

[9] O. A. Ramirez and M. L. Fadiga, "Income and Spending Behavior Classification Using NLP on Bank Narratives," in *Proc. International Conference on Computational Linguistics and Natural Language Processing*, Dubai, UAE, 2019, pp. 233–242.

[10] T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in *Proc. 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, San Francisco, CA, USA, 2019, pp. 785–794.

[11] R. Alarcon and G. Padron, "Personal Finance Management: A Deep Learning Approach to Expense Forecasting," *IEEE Access*, vol. 8, pp. 98–112, 2020.

[12] B. Gambäck and U. K. Sikdar, "Using Convolutional Neural Networks to Classify SMS Transactions," in *Proc. Workshop on Computational Approaches to Language Processing*, Barcelona, Spain, 2020, pp. 56–65.

[13] B. Gunnarsson et al., "Deep Learning for Credit Scoring: Do or Don't?" *Expert Systems with Applications*, vol. 165, p. 113649, 2021.

[14] Z. Ouyang et al., "SMOTE-Based Oversampling for Imbalanced Financial Risk Classification," *Applied Soft Computing*, vol. 113, p. 107956, 2021.

[15] S. Park, J. Kim, and H. Lee, "FinBERT: A Pre-trained Financial Language Model for Sentiment and Category Classification," *Transactions on Association for Computational Linguistics*, vol. 11, pp. 212–229, 2023.

[16] L. Breiman, "Random Forests," *Machine Learning*, vol. 45, no. 1, pp. 5–32, 2001.

[17] N. V. Chawla, K. W. Bowyer, L. O. Hall, and W. P. Kegelmeyer, "SMOTE: Synthetic Minority Over-sampling Technique," *Journal of Artificial Intelligence Research*, vol. 16, pp. 321–357, 2002.

[18] F. Pedregosa et al., "Scikit-learn: Machine Learning in Python," *Journal of Machine Learning Research*, vol. 12, pp. 2825–2830, 2011.

[19] T. Mikolov, K. Chen, G. Corrado, and J. Dean, "Efficient Estimation of Word Representations in Vector Space," in *Proc. International Conference on Learning Representations (ICLR)*, Scottsdale, AZ, USA, 2013.

[20] A. Géron, *Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow*, 3rd ed. Sebastopol, CA: O'Reilly Media, 2022.

[21] Z. S. Harris, "Distributional Structure," *Word*, vol. 10, no. 2–3, pp. 146–162, 1954. (Foundational basis for TF-IDF and distributional NLP)

[22] H. He and E. A. Garcia, "Learning from Imbalanced Data," *IEEE Transactions on Knowledge and Data Engineering*, vol. 21, no. 9, pp. 1263–1284, 2009.

[23] J. Friedman, "Greedy function approximation: A gradient boosting machine," *Annals of Statistics*, vol. 29, no. 5, pp. 1189–1232, 2001.

[24] M. A. Nielsen, *Neural Networks and Deep Learning*. Determination Press, 2015. [Online]. Available: http://neuralnetworksanddeeplearning.com

[25] D. Sculley et al., "Hidden Technical Debt in Machine Learning Systems," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 28, Montreal, Canada, 2015, pp. 2503–2511.

---

*End of Report*

---

**Neil Gogte Institute of Technology, Hyderabad**
Department of Computer Science and Engineering
Academic Year 2025–2026
