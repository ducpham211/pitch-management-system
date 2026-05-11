<div align="center">
  <img src="https://socialify.git.ci/ducpham211/pitch-management-system/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Circuit%20Board&theme=Dark" alt="Pitch Management System" width="640" height="320" />
  
  <br/>
  
  # 🏆 Pitch Management System
  
  **A platform connecting pitch owners and players directly, integrating a smart matchmaking algorithm and automated payment management.**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg?logo=redis)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-blueviolet.svg?logo=stripe)](https://stripe.com/)

</div>

---

## ✨ Features

- **Role-based access control (Owner / Staff / Customer)**
- **Real-time notifications via WebSocket**
- **Pitch booking with conflict detection & pagination**
- **JWT authentication with refresh token flow**
- **Audit logging & schema migration via Flyway**

## 🏗 Architecture

```mermaid
graph TD
    Client --> SpringSecurity[Spring Security JWT]
    SpringSecurity --> Controller
    Controller --> Service
    Service --> Repository[Repository JPA]
    Repository --> PostgreSQL[(PostgreSQL)]
    Service --> Redis[(Redis Cache)]
    Service --> WebSocket[WebSocket Notifications]
```

## 🛠 Tech Stack

| Layer     | Technology                          |
| :-------- | :---------------------------------- |
| Backend   | Java 21, Spring Boot 3.2, MapStruct |
| Security  | Spring Security, JWT                |
| Database  | PostgreSQL, Hibernate, Flyway       |
| Cache     | Redis (Dockerized)                  |
| Real-time | WebSocket (STOMP)                   |

## 🚀 Getting Started

**Prerequisites:**

- **Java 21**
- **Node.js 18+** (nvm recommended)
- **PostgreSQL 15+** (Or use a cloud service like Supabase)
- **Docker & Docker Compose** (to run local Redis)

### Step 1: Clone the repository and setup environment

```bash
git clone https://github.com/ducpham211/pitch-management-system.git
cd pitch-management-system
```

Run Redis Server via Docker (Required for Lock system and Cache):

```bash
docker-compose up -d --build
# Or run manually if not using compose:
# docker run -d -p 6379:6379 redis
```

### Step 2: Run the Backend (Spring Boot)

```bash
cd backend
```

Create a `.env` file (or configure directly in `application.yml`) with the following parameters:

```env
DB_URL=jdbc:postgresql://localhost:5432/pitch_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key_for_jwt_auth_12345
REDIS_HOST=localhost
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=https://<project>.supabase.co
```

Run the backend project:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

### Step 3: Run the Frontend (React)

Open a new terminal, return to the root directory and navigate to the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file for the frontend:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

Run the user interface:

```bash
npm run dev
# Open your browser at http://localhost:5173
```

## ⚙️ Environment Variables

| Variable            | Description                     |
| :------------------ | :------------------------------ |
| `DB_URL`            | PostgreSQL connection           |
| `DB_USERNAME`       | Database user                   |
| `DB_PASSWORD`       | Database password               |
| `JWT_SECRET`        | JWT signing key                 |
| `REDIS_HOST`        | Redis host (default: localhost) |
| `STRIPE_SECRET_KEY` | Stripe Payment Key              |
| `SUPABASE_URL`      | Supabase API URL                |

## 📂 Project Structure

The system is divided into 2 sub-repositories (Monorepo-style) located in the same root directory:

### 1. Backend (`/backend`)

```text
backend/
├── src/main/java/com/example/backend/
│   ├── controller/     # Handles incoming Requests and returns Responses (REST API)
│   ├── service/        # Contains all core Business Logic
│   ├── repository/     # Interfaces for PostgreSQL communication (JPA/Hibernate)
│   ├── security/       # Spring Security configuration & JWT processing
│   ├── dto/            # Data Transfer Objects for receiving/sending data (with MapStruct)
│   ├── entity/         # Classes mapping directly to Database tables
│   └── exception/      # Global Exception handling (ControllerAdvice)
└── db/migration/       # Flyway SQL scripts for database versioning
```

### 2. Frontend (`/frontend`)

```text
frontend/
├── src/
│   ├── components/     # Shared UI components (Buttons, Modals, Navbar...)
│   ├── pages/          # Main pages (Home, Booking, MatchFinder, Dashboard...)
│   ├── hooks/          # Custom React Hooks (e.g., useAuth, useWebSocket)
│   ├── services/       # API call files to the Backend (Axios instances)
│   ├── store/          # Global State management (Redux / Zustand)
│   └── utils/          # Utility functions for formatting dates, currency, etc.
└── tailwind.config.js  # UI framework configuration
```

## 🔌 API Overview

| Method | Endpoint             | Description         | Auth |
| :----- | :------------------- | :------------------ | :--: |
| POST   | `/api/auth/login`    | Login, get JWT      |  ❌  |
| GET    | `/api/fields`        | List fields (paged) |  ✅  |
| POST   | `/api/bookings`      | Create booking      |  ✅  |
| GET    | `/api/bookings/{id}` | Booking detail      |  ✅  |

## ✍️ Author

**Pham Viet Duc** - [GitHub](https://github.com/ducpham211)

- [LinkedIn](https://linkedin.com/in/viet-duc-pham)
