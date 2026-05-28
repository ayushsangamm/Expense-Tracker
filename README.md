# FinFlow: Modern MERN Stack Personal Finance & Expense Tracker

FinFlow is a highly responsive, visually stunning, and beginner-to-intermediate-friendly Personal Finance and Expense Tracker built using the **MERN (MongoDB, Express, React, Node.js)** stack. Drawing visual inspiration from premium SaaS products like Stripe and Linear, FinFlow features elegant glassmorphism designs, default dark mode, responsive statistical dashboards, animated analytics graphs (via Recharts), and dynamic spending suggestions.

---

## 🚀 Key Features

1. **Secure Session Authentication:**
   - Standard email/password registration with password hashing using `bcryptjs`.
   - Custom JWT (JSON Web Token) generation and headers interceptors.
   - Google Sign-In using the modern official Google Identity Services HTML SDK.
   - **One-Click Demo Fast Login:** An offline developer bypass enabling instant login with pre-populated dummy transaction datasets for testing without configuring external cloud keys!

2. **Statistical Finance Dashboard:**
   - Metric cards (Total Balance, Inflows, Outflows, Savings Rate) with elegant hover scaling.
   - Smart logical insights card (alerts for high expenditure, analyzes top spending categories, evaluates savings metrics, and provides finance tips).
   - Recent transaction logs list with inline editing and deletion actions.

3. **Transaction Logs & Search:**
   - Full search filters (query descriptions, categories, types, start/end dates).
   - Clean pop-up form modal for creating and updating transactions.
   - Recurring transactions configurations (weekly / monthly intervals).
   - **Client-Side CSV Exporter:** Encodes active logs into structured CSVs and auto-triggers a download directly in the browser.

4. **Budget Management:**
   - Dynamic budget progress tracking per category (Food, Bills, Shopping, Travel, etc.) alongside spent ratios.
   - Color-shifting visual progress bars (shifts from Violet to Amber at 80% limit and turns Rose when exceeded).
   - Real-time inline limit updates directly on cards.

5. **Animated Reports & Analytics:**
   - **Recharts Donut Chart:** Visualizes outflows categorical distributions.
   - **Recharts Dual Bar Chart:** Compares monthly incomes vs expenses chronologically.
   - **Recharts Area Graph:** Traces chronological savings and cash growth balance curves over time.

---

## 📁 Folder Structure

### Backend Layout (`/backend`)
```text
backend/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── controllers/
│   ├── authController.js     # User registration, logins, & Google Auth verify
│   ├── budgetController.js   # Budget CRUD actions & analysis progress
│   └── transactionController.js # Transaction CRUD & monthly summaries
├── middleware/
│   ├── authMiddleware.js     # JWT validation middleware
│   └── errorMiddleware.js    # Standard Express error catcher
├── models/
│   ├── User.js               # Mongoose User Schema
│   ├── Transaction.js        # Mongoose Transaction Schema
│   └── Budget.js             # Mongoose Budget Schema
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── budgetRoutes.js       # /api/budgets routes
│   └── transactionRoutes.js  # /api/transactions routes
├── .env.example              # Template for environmental variables
├── package.json              # Backend package list
└── server.js                 # App startup entry point
```

### Frontend Layout (`/frontend`)
```text
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AddTransactionModal.jsx # Popup form modal for creating/updating
│   │   ├── BudgetProgress.jsx # Renders progress against budget limits
│   │   ├── EmptyState.jsx    # Styled state for empty searches/logs
│   │   ├── InsightCard.jsx   # AI-like logic spending advice
│   │   ├── LoadingSkeleton.jsx # Skeleton card loading states
│   │   ├── Navbar.jsx        # Premium glassy navigation header
│   │   └── ProtectedRoute.jsx # Route guardian checking token validations
│   ├── context/
│   │   └── AuthContext.jsx   # Global React context for auth state
│   ├── pages/
│   │   ├── Analytics.jsx     # visual trends, categorizations charts
│   │   ├── Dashboard.jsx     # Centralized stats, recent entries, simple budget view
│   │   ├── Login.jsx         # Sign-in & Google OAuth entry page
│   │   ├── Profile.jsx       # User avatar management and statistics
│   │   ├── Signup.jsx        # Registration screen
│   │   └── Transactions.jsx  # Interactive searches, filters, exports
│   ├── utils/
│   │   └── api.js            # Centralized Axios setup with headers interceptor
│   ├── App.jsx               # Routes wrapper and Toast config
│   ├── index.css             # Root Tailwind styles and Google Font definitions
│   └── main.jsx              # Vite React runtime mounting point
```

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16 or higher) and [MongoDB](https://www.mongodb.com/) installed on your computer.

### Step 1: Clone and Prepare Workspace
Download the codebase and enter the root workspace:
```bash
cd "d:\expense tracker"
```

### Step 2: Configure & Start Backend Server
1. Enter the `backend` folder:
   ```bash
   cd backend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. The `.env` file is pre-configured with active defaults:
   - `PORT=5000` (Server running port)
   - `MONGO_URI=mongodb://localhost:27017/finflow` (Local MongoDB)
   - `JWT_SECRET=supersecretkeyforfinflowappauth123!` (JWT security key)
4. Start the server in Development mode (with nodemon auto-refresh):
   ```bash
   npm run dev
   ```
   *You should see a green print: `✓ MongoDB Connected Successfully` and `⚡ Server is actively running on port 5000`.*

### Step 3: Configure & Start Frontend Client
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Boot up the Vite developer server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (typically `http://localhost:5173`).

---

## 🔑 Demonstration Guide (Fast Review)

FinFlow is designed to be easily tested. If you don't have a local MongoDB connection running immediately or haven't configured a Google OAuth Developer key yet:
1. Open the login page (`http://localhost:5173/login`).
2. Click the **"One-Click Demo Developer Login"** button.
3. This automatically triggers our backend offline verification bypass. It creates a dummy profile in memory/database, generates a secure JWT token, and boots you directly into a fully functional dashboard loaded with visual graphs, transactions list, and active budget limits.

---

## 📖 REST API Documentation

All secure endpoints require the `Authorization` header populated in the format: `Bearer <JWT_TOKEN>`. (Handled automatically by the frontend Axios interceptor).

### 1. Authentication Services
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register standard email/password accounts |
| **POST** | `/api/auth/login` | Public | Sign in using standard email/password |
| **POST** | `/api/auth/google` | Public | Sign in/up verifying Google OAuth ID Tokens |
| **GET** | `/api/auth/profile` | Private | Retrieve logged-in session profile metadata |
| **PUT** | `/api/auth/profile` | Private | Update user details (name, password, avatar URL) |

### 2. Transaction Services
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/transactions` | Private | Log a new transaction (income / expense) |
| **GET** | `/api/transactions` | Private | Retrieve transaction logs (supports search/filter query parameters) |
| **PUT** | `/api/transactions/:id` | Private | Edit an existing transaction details |
| **DELETE**| `/api/transactions/:id` | Private | Delete a transaction record |
| **GET** | `/api/transactions/stats`| Private | Retrieve consolidated sums, pie distributions, and monthly trends |

### 3. Budgets Services
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/budgets` | Private | Create or Update (upsert) a budget limit per month and category |
| **GET** | `/api/budgets` | Private | Retrieve all active budgets for a target month |
| **GET** | `/api/budgets/progress`| Private | Retrieve spent, remaining, and percentage values against budgets |

---

## 🛡️ Google Authentication Setup Steps

If you want to configure your custom production Google Sign-In:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Go to **APIs & Services > Credentials** and configure your **OAuth Consent Screen**.
4. Click **Create Credentials > OAuth Client ID** (select **Web Application**).
5. Add Authorized JavaScript Origins: `http://localhost:5173` (Vite's URL).
6. Copy your generated **Client ID**.
7. Paste this Client ID in your backend `.env` file under the key `GOOGLE_CLIENT_ID`, and update the client key in the `frontend/src/pages/Login.jsx` initialization block.
