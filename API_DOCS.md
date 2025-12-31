# Novel Exporters API Documentation

**Base URL**: `http://localhost:5000/api`

---

## 🔐 Authentication (`/auth`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/register` | `POST` | Create new account (Username, Email, Phone, Password) | No |
| `/login` | `POST` | Authenticate and get JWT Token | No |
| `/me` | `GET` | Get current logged-in user details | Yes (JWT) |
| `/cart` | `POST` | Sync/Update user's active shopping cart | Yes (JWT) |
| `/forgot-password` | `POST` | Trigger password reset email | No |
| `/reset-password/:token` | `POST` | Set new password using email token | No |
| `/all-users` | `GET` | **Admin Only**: List all registered partners | Yes (Admin) |

---

## 📦 Orders & Quotations (`/orders`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | `POST` | Submit a new quotation request (with items and delivery date) | Yes (JWT) |
| `/my-orders` | `GET` | View your personal history of requests | Yes (JWT) |
| `/all` | `GET` | **Admin Only**: View every request in the system | Yes (Admin) |
| `/:id/status` | `PUT` | **Admin Only**: Update order status and add admin notes | Yes (Admin) |
| `/analytics` | `GET` | **Admin Only**: Get product-level demand statistics | Yes (Admin) |

---

## ✉️ Business Enquiries (`/enquiry`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | `POST` | Send a general business message/query | No / Optional |
| `/all` | `GET` | **Admin Only**: View all contact messages | Yes (Admin) |

---

## 🤖 AI Assistant (`/chat`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/chat` | `POST` | Communicate with the Gemini 2.0 AI (includes product catalog grounding) | No |

---

## 🛠️ Developer Notes

### 🔑 Authentication Header
All protected routes require the JWT token to be sent in the header:
`x-auth-token: <your_jwt_token_here>`

### ⚠️ Common Errors
*   **401 Unauthorized**: Missing or invalid token.
*   **403 Forbidden**: Accessing admin routes with a standard user account.
*   **500 MongoDB Connection**: Ensure your local MongoDB service is running at `mongodb://localhost:27017`.
