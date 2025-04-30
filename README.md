# Foodastic REST API

Foodastic is a Node.js backend API for a food ordering system. It handles users, foods, nutrition data, chat messages, restaurants, shopping carts, and orders.

## Features

- User registration & login
- Food and nutrition filtering
- Allergen-safe filtering
- Chat system between users
- Shopping cart and order management
- Admin-level operations: create/update/delete resources
- SQL injection safe (via prepared statements)
- Configurable via environment variables

## Technologies

- Node.js + Express
- MySQL2 (promise-based)
- dotenv
- Helmet (security headers)
- CORS

---

## Installation

```bash
git clone https://github.com/ynwch3f/foodastic_backend
cd foodastic_backend
pnpm install