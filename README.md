# Softdrink Crate Tracking API

A RESTful backend prototype for managing softdrink deliveries, store crate balances, pickup requests, and returnable container tracking. Course project for **ITEC 116 - IT Elective 4 (Systems Integration and Architecture 2)**.

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | NestJS (TypeScript) |
| **ORM** | TypeORM |
| **Database** | MySQL |
| **Authentication** | JWT with bcrypt password hashing & Role-Based Access Control (RBAC) |
| **API Testing** | Postman |
| **Version Control** | Git & GitHub |

## Prerequisites

- Node.js (LTS) and npm
- MySQL (via Laragon, XAMPP, or standalone MySQL server)

## How to Run Locally

1. **Create the MySQL database:**
   ```sql
   CREATE DATABASE softdrink_crate_db;
   ```
   *(Optional: Import the exported `.sql` dump to load existing schema and sample records.)*

2. **Run the server:**
   ```bash
   npm run start:dev
   ```
   The API runs on `http://localhost:3000`.

## Database Entities

The MySQL database (`softdrink_crate_db`) consists of five TypeORM entities:

| Entity / Table | Description | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | System accounts with RBAC roles (`logistics_manager`, `driver`, `store_owner`) | Owns `stores`; assigned to `deliveries` and `crate_returns` |
| **`stores`** | Partner retail stores tracked for active `crateBalance` | Belongs to a `store_owner` (`users`); linked to `deliveries`, `pickup_requests`, and `crate_returns` |
| **`deliveries`** | Scheduled and confirmed softdrink deliveries (increases store `crateBalance`) | References `stores`, assigned `driver`, and creating `logistics_manager` |
| **`pickup_requests`** | Empty crate pickup requests submitted by store owners for approval | References `stores` and approving `logistics_manager` |
| **`crate_returns`** | Recorded empty crate returns (decreases store `crateBalance`) | References `stores`, `pickup_requests`, and receiving `driver` |

## Authentication

- **Login Endpoint:** `POST /auth/login`
- **Authorization Header:** `Authorization: Bearer <access_token>`

Seeded test credentials are pre-configured in the exported Postman collection and SQL database dump.

## Testing with Postman

1. Import `Softdrink Crate Tracking API (Complete + Error Cases).postman_collection.json` into Postman.
2. Run the login request to automatically save the Bearer token.
3. Run the requests across folders (`Auth`, `Users`, `Stores`, `Deliveries`, `Pickup Requests`, `Crate Returns`) to verify role access and error responses (`400`, `401`, `403`, `404`).