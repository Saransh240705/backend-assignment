# Backend Intern Assignment

A production-ready full-stack application consisting of a scalable **Express REST API with Role-Based Access Controls** and a polished **React + TypeScript (Vite)** frontend client. The application demonstrates JWT-based authentication, user authorization (User vs. Admin), input validation, centralized logging, and task management.

---

## 🛠️ Project Structure

The project is structured modularly for easy extensibility:
```text
backend-assignment/
├── backend/
│   ├── prisma/             # SQLite DB and Prisma schema
│   └── src/
│       ├── config/         # Database and Swagger configs
│       ├── controllers/    # API controllers
│       ├── middleware/     # JWT authentication and error validation middleware
│       ├── routes/         # Express API routes (auth, tasks, users)
│       ├── utils/          # Winston logger and custom errors
│       └── validators/     # Zod schema definitions
├── frontend/
│   ├── src/
│   │   ├── components/     # UI elements (Auth Forms, Dashboard, TaskList)
│   │   ├── styles/         # Glassmorphism design system CSS
│   │   └── utils/          # API fetch wrapper
│   └── index.html
└── README.md               # Master documentation and scalability note
```

---

## 💾 Database Schema

The SQLite schema represents a standard relation model:
* **User**: Holds authentication data and user profile. Roles are either `USER` or `ADMIN`.
* **Task**: Holds title, description, status (`PENDING`, `IN_PROGRESS`, `COMPLETED`), priority (`LOW`, `MEDIUM`, `HIGH`), and dueDate. It is related to `User` via a many-to-one relationship.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Setup Database & Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync database schema and generate the Prisma client:
   ```bash
   npm run db:generate
   npx prisma db push
   ```
4. Seed the database with initial users and tasks:
   ```bash
   npx ts-node prisma/seed.ts
   ```
   * *Seeds created:*
     * **Admin User:** `admin@example.com` (password: `password123`)
     * **Normal User:** `user@example.com` (password: `password123`)
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5050` with Swagger docs available at `http://localhost:5050/api-docs`.

### Setup Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The client will boot on `http://localhost:5173` (or the next available port).

---

## 📖 API Documentation & Swagger

The backend API implements standard RESTful principles with appropriate HTTP status codes:
- **`POST /api/v1/auth/register`**: Register a new user (role defaults to `USER` unless specified as `ADMIN`).
- **`POST /api/v1/auth/login`**: Authenticate credentials and return a signed JWT.
- **`GET /api/v1/auth/me`**: Get currently authenticated user profile details (JWT required).
- **`GET /api/v1/tasks`**: Retrieve list of tasks. Normal users only get their own tasks. Admins get all tasks in the system.
- **`POST /api/v1/tasks`**: Create a new task (Normal users create for themselves; Admins can assign to any user).
- **`GET /api/v1/tasks/:id`**: View task details (requires owner or admin).
- **`PUT /api/v1/tasks/:id`**: Update task fields (requires owner or admin).
- **`DELETE /api/v1/tasks/:id`**: Delete a task (requires owner or admin).
- **`GET /api/v1/users`**: List all users (Admin only).

Interactive Swagger documentation is served live at `http://localhost:5050/api-docs`.

---

## 📈 Scalability & Production Readiness Note

To transition this application from a local development instance to an enterprise-grade platform capable of serving millions of requests, the following architectural upgrades would be implemented:

### 1. Stateless Authentication & JWT Security
* **Stateless JWTs:** Authentication remains fully stateless. The REST API validates tokens using the shared `JWT_SECRET` key, meaning individual servers do not need to query a central database or session store to authorize requests.
* **Token Rotation & Refresh:** Implement short-lived Access Tokens (e.g., 15 minutes) and longer-lived Refresh Tokens (e.g., 7 days) stored in secure, `HttpOnly`, `SameSite=Strict` cookies. Refresh tokens are tracked in a database or Redis cache to allow immediate revocation if a session is compromised.

### 2. Horizontal Scaling & Load Balancing
* **Reverse Proxy & Load Balancer:** Introduce **Nginx** or **HAProxy** (or cloud alternatives like AWS ALB) in front of Express worker instances. The load balancer decrypts SSL certificates (SSL termination) and routes incoming traffic using algorithms like **Round Robin** or **Least Connections**.
* **Process Management:** Within each server, run the application using **PM2** in cluster mode to automatically scale Node.js worker processes to match the host machine's CPU cores.

### 3. High-Performance Caching with Redis
* **Database Query Caching:** Implement a Cache-Aside pattern using **Redis**. Frequently accessed queries (e.g., list of users, or static tasks) are cached in Redis with a Time-To-Live (TTL). Subsequent reads fetch directly from RAM in `< 2ms`.
* **Rate Limiting Persistence:** Move the local Express rate limiter storage to a shared Redis instance. This ensures rate limits are enforced across all horizontal Express server instances.
* **Session Cache:** If sticky sessions or session-state tracking is required, store them in Redis.

### 4. Database Scaling & Migration to PostgreSQL
* **Production Database:** Transition from SQLite to a managed **PostgreSQL** cluster (e.g., Amazon RDS, GCP Cloud SQL).
* **Connection Pooling:** Use **PgBouncer** to pool database connections, preventing Node's async event loop from exhausting DB connections during high concurrency.
* **Database Replication:** Set up one Primary PostgreSQL node for write operations and multiple Read Replicas. Configure Express to direct write requests to the primary DB and read requests (`GET` endpoints) to read replicas.
* **Indexing:** Add database indexes on frequently queried fields, specifically `User.email` (unique index), `Task.userId`, `Task.status`, and `Task.priority`.

### 5. Microservices Migration Roadmap
If the feature set expands (e.g., adding notifications, reporting, or AI helpers):
* **Service Decomposition:** Split the monolith into separate services:
  1. **Auth Service:** Manages user registration, login, and token generation.
  2. **Task Service:** Handles tasks CRUD and prioritization.
  3. **Notification Service:** Dispatches email alerts or push notifications.
* **API Gateway:** Place an API Gateway (such as **Kong** or **AWS API Gateway**) in front of services. The gateway handles centralized routing, rate limiting, and global auth validation.
* **Message Broker:** Use **RabbitMQ** or **Apache Kafka** for asynchronous inter-service communication. For example, when a task is created or updated, the Task Service publishes a `task.created` event, which is asynchronously consumed by the Notification Service.

### 6. Containerization & CI/CD Deployment
* **Docker Containerization:** Package the backend and frontend into independent Docker containers using multi-stage builds to optimize image size.
* **Orchestration (Kubernetes/ECS):** Deploy the containers using **Kubernetes** or **AWS ECS** to manage auto-scaling, self-healing, rolling updates, and environment config injection.
