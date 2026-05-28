# FinFlow: Modern MERN Stack Personal Finance & Expense Tracker

FinFlow is a highly responsive, visually stunning, and beginner-to-intermediate-friendly Personal Finance and Expense Tracker built using the **MERN (MongoDB, Express, React, Node.js)** stack. Drawing visual inspiration from premium SaaS products like Stripe and Linear, FinFlow features elegant glassmorphism designs, default dark mode, responsive statistical dashboards, animated analytics graphs (via Recharts), and dynamic spending suggestions.

---

##  Key Features

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


