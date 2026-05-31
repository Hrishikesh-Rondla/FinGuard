# 🛡️ FinGuard — ML-Based Financial Stress Prediction & Early Warning System

A full-stack, ML-integrated web application that predicts financial stress levels and generates personalized early warning alerts with actionable recommendations.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FinGuard System                          │
├─────────────┬──────────────────┬────────────────┬───────────────┤
│   Client    │     Server       │   ML Service   │   Database    │
│  React 18   │   Express.js     │    FastAPI      │   MongoDB 7   │
│  Vite       │   JWT Auth       │    XGBoost      │   Mongoose    │
│  Tailwind   │   REST API       │    Scikit-learn │               │
│  Recharts   │   Axios → ML     │    SMOTE        │               │
│  :3000      │   :5000          │    :8000        │   :27017      │
└──────┬──────┴────────┬─────────┴───────┬────────┴───────────────┘
       │               │                 │
       │  HTTP/REST     │   HTTP/REST     │
       └───────────────►└────────────────►│
```

### Data Flow
```
User → React Frontend → Express API → MongoDB (store transactions)
                                    → FastAPI ML Service (predict stress)
                                    → MongoDB (store predictions + alerts)
                                    ← Response with stress level, recommendations
```

---

## 🚀 Quick Start — Step by Step

### Prerequisites
- **Node.js** 18+ and npm (`node --version` to check)
- **Python** 3.10+ and pip (`python --version` to check)
- **MongoDB** running locally (as a service or via Docker)
- **Git**

### Step 0: Clone & Setup Dataset

```bash
git clone https://github.com/Hrishikesh-Rondla/FinGuard.git
cd FinGuard
```

> **Important**: Download the [Give Me Some Credit dataset](https://www.kaggle.com/c/GiveMeSomeCredit/data) from Kaggle and place `cs-training.csv` inside `ml_service/data/`:
```bash
mkdir -p ml_service/data
# Copy cs-training.csv into ml_service/data/
```

### Step 1: Start the ML Service (Terminal 1)

```bash
cd ml_service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> On first startup, the service will automatically train the model using the dataset (~15-30 seconds). You'll see training metrics printed to the console. Subsequent startups will skip training and load the saved model instantly.

**Verify**: Open `http://localhost:8000/health` in your browser — you should see:
```json
{"status": "healthy", "model_loaded": true, "version": "1.0.0"}
```

### Step 2: Start the Backend Server (Terminal 2)

```bash
cd server
npm install
```

**Seed the database** (creates a demo user with 3 months of sample transactions):
```bash
npm run seed
```

**Start the server**:
```bash
npm run dev
```

**Verify**: You should see:
```
FinGuard server running on port 5000
MongoDB Connected: localhost
```

### Step 3: Start the Frontend (Terminal 3)

```bash
cd client
npm install
npm run dev
```

**Verify**: Open `http://localhost:3000` in your browser.

### Step 4: Login & Use the App

Open `http://localhost:3000` and login with the demo account:

```
Email:    demo@finguard.com
Password: password123
```

Once logged in:
1. **Dashboard** — View KPIs, expense charts, and stress gauge
2. Click **"Run Prediction"** — The system aggregates your transactions, sends them to the ML model, and displays your stress level with recommendations
3. **Transactions** — Add/edit/delete financial transactions
4. **Predictions** — View your prediction history and stress trends
5. **Profile** — Update your monthly income

---

## 🐳 Option 2: Docker Compose

If you have Docker installed and running:

```bash
docker-compose up --build
```

This starts all services automatically:
- **MongoDB** at `localhost:27017`
- **ML Service** at `localhost:8000`
- **Express Server** at `localhost:5000`
- **React Client** at `localhost:3000`

---

## 🔑 Demo Credentials

After running the seed script (`npm run seed` in the server directory):
```
Email:    demo@finguard.com
Password: password123
```

---

## 📁 Project Structure

```
FinGuard/
├── client/                 # React 18 Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Sidebar, Navbar, AppLayout
│   │   │   ├── dashboard/  # KPICard, StressGauge, Charts
│   │   │   ├── transactions/  # TransactionTable, TransactionForm
│   │   │   └── alerts/     # RecommendationCard
│   │   ├── pages/          # Login, Register, Dashboard, Transactions,
│   │   │                   # Predictions, Profile
│   │   ├── context/        # AuthContext, AlertContext
│   │   ├── services/       # api.js (Axios with JWT interceptors)
│   │   └── App.jsx         # Root component & routing
│   ├── .env                # VITE_API_BASE_URL
│   └── vite.config.js      # Dev server config with API proxy
│
├── server/                 # Express.js Backend API
│   ├── config/db.js        # MongoDB connection
│   ├── controllers/        # authController, transactionController,
│   │                       # predictionController
│   ├── middleware/          # JWT auth & error handling
│   ├── models/             # User, Transaction, Prediction
│   ├── routes/             # API route definitions
│   ├── services/mlService.js  # Axios client for FastAPI ML service
│   ├── seed.js             # Demo data seeder
│   ├── .env                # PORT, MONGO_URI, JWT_SECRET, ML_SERVICE_URL
│   └── index.js            # Entry point
│
├── ml_service/             # Python FastAPI ML Service
│   ├── app/
│   │   ├── ml/
│   │   │   ├── train.py    # Full training pipeline (3 models)
│   │   │   ├── predict.py  # Model inference
│   │   │   ├── features.py # Feature engineering (12 features)
│   │   │   ├── recommend.py # Recommendation engine
│   │   │   └── artifacts/  # Saved .joblib model files
│   │   ├── routes/predict.py  # POST /predict endpoint
│   │   └── main.py         # FastAPI entry point (auto-trains on startup)
│   ├── data/               # Place cs-training.csv here (gitignored)
│   └── requirements.txt
│
├── docker-compose.yml      # Multi-service Docker setup
└── README.md
```

---

## 🤖 ML Model Details

### Input Features (12)
| Feature | Description |
|---------|-------------|
| monthly_income | User's monthly income |
| total_expenses | Total monthly expenses |
| total_savings | Total savings amount |
| savings_rate | savings / income ratio |
| expense_to_income_ratio | expenses / income ratio |
| discretionary_spending_ratio | entertainment+dining+shopping / total expenses |
| essential_spending_ratio | rent+groceries+utilities+transport / total expenses |
| debt_to_income_ratio | debt payments / income ratio |
| num_transactions | Transaction count this month |
| avg_transaction_value | Average transaction amount |
| income_volatility | Standard deviation of last 3 months income |
| months_of_emergency_fund | savings / avg monthly expenses |

### Output
- **Stress Level**: Low (0), Medium (1), High (2)
- **Probabilities**: Confidence for each class
- **Recommendations**: 3-5 personalized financial tips

### Models Trained & Compared
| Model | Accuracy | F1 Score | ROC-AUC |
|-------|----------|----------|---------|
| Logistic Regression | 79.63% | 0.8008 | 0.9241 |
| **Random Forest** ⭐ | **93.18%** | **0.9311** | **0.9676** |
| XGBoost | 93.01% | 0.9294 | 0.9665 |

**Best model: Random Forest** — selected by highest weighted F1-score.

### Training Dataset
[Kaggle — Give Me Some Credit](https://www.kaggle.com/c/GiveMeSomeCredit) (~150K records)

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Login & get JWT |
| POST | `/logout` | Logout |
| GET | `/me` | Get current user |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List transactions (paginated) |
| POST | `/` | Add transaction |
| PUT | `/:id` | Update transaction |
| DELETE | `/:id` | Delete transaction |
| GET | `/summary` | Monthly summary by category |

### Predictions (`/api/predictions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/run` | Run stress prediction |
| GET | `/history` | Prediction history |
| GET | `/latest` | Latest prediction |

### ML Service (`localhost:8000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run ML prediction |
| GET | `/health` | Service health check |
| GET | `/model-info` | Model metadata |

---

## 🎨 UI Design

- **Theme**: Dark-mode financial dashboard
- **Background**: Deep navy (`#0F172A`)
- **Accents**: Teal (`#00D4AA`), Amber (`#F59E0B`), Rose (`#F43F5E`)
- **Fonts**: IBM Plex Mono (data), DM Sans (body)
- **Style**: Glassmorphism cards with backdrop-blur
- **Responsive**: Sidebar → bottom nav on mobile
- **Animations**: Smooth transitions, pulse ring on high stress

---

## 📝 Environment Variables

### server/.env
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finguard
JWT_SECRET=finguard_jwt_secret_key_2024
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
```

### client/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Both `.env` files are included in the repository with development defaults. For production, create `.env.local` files with your actual secrets (these are gitignored).

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongoDB connection failed` | Ensure MongoDB is running (`mongod` or check Windows Services for "MongoDB") |
| `ML service: model artifacts not found` | Place `cs-training.csv` in `ml_service/data/` and restart the service |
| `CORS errors in browser` | Make sure all 3 services are running on correct ports (3000, 5000, 8000) |
| `npm run seed` fails | Ensure MongoDB is running and `MONGO_URI` in `server/.env` is correct |
| Frontend shows blank page | Check browser console for errors; ensure backend is running on port 5000 |

---

## 📜 License

This project is for educational purposes (college project).
