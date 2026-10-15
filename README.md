# ITMO University - Web Programming Lab №3

A full-stack **Student Management System** migrated to a **Spring Boot 3** backend using **jOOQ** and **PostgreSQL**, featuring stateless **JWT Authentication** (Access & Refresh tokens) and **Role-Based Access Control (RBAC)**.

## Features

- **RESTful Student API:** Full CRUD operations (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with search, filtering, sorting, and pagination.
- **Type-Safe Persistence:** Relational data storage powered by **PostgreSQL**, **Flyway** migrations, and **jOOQ**.
- **JWT Authentication & RBAC:**
  - `ADMIN`: Full access to view, create, update, and delete students.
  - `USER`: Read-only access to student lists and individual dossiers.
- **Validation & Error Handling:** Server-side DTO validation and centralized exception handling.
- **API Documentation:** Interactive OpenAPI / Swagger UI.

## Technologies Used

- **Backend:** Java 17, Spring Boot 3, Spring Security, jOOQ, Flyway, PostgreSQL, JJWT, Springdoc OpenAPI
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/islemAZ360/itmo-web-lab3-student-manager.git
   cd itmo-web-lab3-student-manager
   ```
2. Configure environment variables (see `.env.example`) and ensure a PostgreSQL database named `student_db` is running on port 5432.
3. Run the Spring Boot backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. Open `frontend/index.html` in your browser (or via Live Server).
5. Swagger UI is available at: http://localhost:8080/swagger-ui.html
