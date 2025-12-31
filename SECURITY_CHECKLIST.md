# Security Audit & Checklist: Novel Exporters B2B Portal

## 1. Authentication & Identity
- [x] **Salted Hashing**: Passwords stored using `bcryptjs` (Cost factor: 10).
- [x] **JWT Security**: Tokens signed with `HS256` and stored in local storage for session persistence.
- [x] **Role-Based Access Control (RBAC)**: Middleware strictly separates `admin` and `user` routes.
- [x] **Extended Profile**: Registration now captures **Username, Phone, and Email** as per B2B requirements.

## 2. Data Integrity & Logic
- [x] **Input Sanitization**: Mongoose schemas enforce strict type checking and trimming.
- [x] **Cart Validation**: Quantity limits (minimum 1) enforced on both frontend and backend.
- [x] **Order Isolation**: Users can only view their own `my-orders` history; Admin visibility is global.

## 3. Email Automation
- [x] **Admin Alerts**: Synchronous triggers send full line-item details (Quantity/Requested Date) to the administrator.
- [x] **Client Acknowledgement**: Automated thank-you emails ensure professional touchpoints.

## 4. Production Security Recommendations
- [ ] **SSL/TLS**: Ensure the production environment uses `HTTPS` to encrypt data in transit (SSL termination).
- [ ] **Rate Limiting**: Implement `express-rate-limit` on `/login` and `/register` endpoints to thwart brute-force attacks.
- [ ] **Token Expiry**: Use short-lived JWTs with Refresh Token rotation for higher security.
- [ ] **Environment Variables**: Continue using `.env` for secrets; never commit this to version control.
