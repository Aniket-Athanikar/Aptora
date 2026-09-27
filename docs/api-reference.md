# Aptora — API Reference

Base URL: `http://localhost:8000`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email, generates OTP |
| POST | `/api/v1/auth/signup` | Register new account |
| POST | `/api/v1/auth/verify-otp` | Verify OTP code |
| POST | `/api/v1/auth/forgot-password` | Request password reset OTP |
| POST | `/api/v1/auth/reset-password` | Reset password with OTP |
| GET | `/api/v1/auth/latest-otp?email=` | Dev: retrieve latest OTP |
| POST | `/api/v1/auth/logout` | Logout and clear CSRF cookie |

## Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile?email=` | Get user profile |
| POST | `/api/v1/profile?email=` | Update user profile |

## Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/send-invoice` | Generate and email invoice |
| GET | `/api/v1/billing/history?email=` | Get billing history |
| PUT | `/api/v1/billing/orders/{id}` | Update an order |
| DELETE | `/api/v1/billing/orders/{id}` | Delete an order |

## Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/account/request-deletion` | Request account deletion |
| POST | `/api/v1/account/get-otp` | Dev: get deletion OTP |
| POST | `/api/v1/account/verify-deletion` | Verify and execute deletion |

## Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/contact` | Submit contact form |

## Newsletter

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/newsletter/subscribe` | Subscribe to newsletter |

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/contacts` | List all contact submissions |
| DELETE | `/api/v1/admin/contacts/{id}` | Delete a contact entry |
| GET | `/api/v1/admin/newsletter` | List newsletter subscribers |
| DELETE | `/api/v1/admin/newsletter/{id}` | Delete a subscriber |

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service health + dependency status |
