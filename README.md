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

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+ and pip
- **MongoDB** running locally (or use Docker)
- **Git**

### Option 1: Run Services Individually

#### 1. ML Service (Python/FastAPI)
```bash
cd ml_service
pip install -r requirements.txt

# Place the Kaggle "Give Me Some Credit" dataset:
# ml_service/data/cs-training.csv

# Start the service (auto-trains model on first run)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Backend Server (Node.js/Express)
```bash
cd server
npm install

# Seed the database with demo data
npm run seed

# Start the server
npm run dev
```

#### 3. Frontend Client (React/Vite)
```bash
cd client
npm install
npm run dev
```

### Option 2: Docker Compose
```bash
docker-compose up --build
```

This starts all services:
- **MongoDB** at `localhost:27017`
- **ML Service** at `localhost:8000`
- **Express Server** at `localhost:5000`
- **React Client** at `localhost:3000`

---

## 🔑 Demo Credentials

After running the seed script:
```
Email:    demo@finguard.com
Password: password123
```

---

## 📁 Project Structure

```
finguard/
├── client/                 # React 18 Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # Auth & Alert contexts
│   │   ├── services/       # API client (Axios)
│   │   └── App.jsx         # Root component & routing
│   └── vite.config.js
│
├── server/                 # Express.js Backend API
│   ├── config/             # Database config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth & error middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── services/           # ML service client
│   ├── seed.js             # Demo data seeder
│   └── index.js            # Entry point
│
├── ml_service/             # Python FastAPI ML Service
│   ├── app/
│   │   ├── ml/             # Training, inference, features
│   │   ├── routes/         # API endpoints
│   │   └── main.py         # FastAPI entry point
│   ├── data/               # Training dataset (gitignored)
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
- **Risk Factors**: Top 3 contributing risk indicators

### Models Trained
1. Logistic Regression (baseline)
2. Random Forest (n=200, depth=10)
3. XGBoost (n=300, lr=0.05, depth=6)

Best model selected by weighted F1-score.

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

### Alerts (`/api/alerts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | All alerts |
| PUT | `/:id/read` | Mark as read |
| PUT | `/read-all` | Mark all read |
| DELETE | `/:id` | Dismiss alert |

### ML Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run ML prediction |
| GET | `/health` | Service health check |
| GET | `/model-info` | Model metadata |

---

## 🎨 UI Design

- **Theme**: Dark-mode financial dashboard
- **Background**: Deep navy (#0F172A)
- **Accents**: Teal (#00D4AA), Amber (#F59E0B), Rose (#F43F5E)
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

---

## 📜 License

This project is for educational purposes (college project).
