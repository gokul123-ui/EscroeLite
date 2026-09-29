# EscrowLite - Smart Milestone Escrow System

A full-stack escrow payment management system built using **Spring Boot (Java 21)**, **MySQL**, and **Vanilla HTML, CSS, and JavaScript**.

---

## 📌 Project Overview

**EscrowLite** guarantees trust between clients and freelancers by holding project funds in escrow and releasing payments milestone by milestone upon deliverable completion and approval.

### Escrow Workflow

```text
Create Project
      ↓
Create Milestone
      ↓
Start Milestone (PENDING → IN_PROGRESS)
      ↓
Mark Completed (IN_PROGRESS → COMPLETED)
      ↓
Release Payment (COMPLETED → RELEASED)
      ↓
Save Release Record & Update Escrow Balance
```

---

## 🛠 Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL
- **Frontend:** HTML5, Modern Vanilla CSS, JavaScript (Fetch API)
- **Port:** `8081` (`http://localhost:8081`)

---

## 📂 Project Structure

```text
EscrowLite/
│
├── src/
│   ├── main/
│   │   ├── java/com/escrowlite/
│   │   │   ├── EscrowLiteApplication.java
│   │   │   ├── controller/
│   │   │   │   ├── ProjectController.java
│   │   │   │   ├── MilestoneController.java
│   │   │   │   └── ReleaseController.java
│   │   │   ├── service/
│   │   │   │   ├── ProjectService.java
│   │   │   │   ├── MilestoneService.java
│   │   │   │   └── ReleaseService.java
│   │   │   ├── entity/
│   │   │   │   ├── Project.java
│   │   │   │   ├── Milestone.java
│   │   │   │   └── Release.java
│   │   │   └── repository/
│   │   │       ├── ProjectRepository.java
│   │   │       ├── MilestoneRepository.java
│   │   │       └── ReleaseRepository.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── style.css
│   │           └── script.js
│
├── pom.xml
└── README.md
```

---

## 🗄️ Database Setup

1. Start your local MySQL server.
2. The database name is `escrowlite`.
3. Spring Boot is configured to auto-create the database if it doesn't exist (`createDatabaseIfNotExist=true`).
4. Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/escrowlite?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

---

## 🚀 How to Run the Application

### 1. Build and Run via Maven Wrapper

```bash
# In the project directory
./mvnw clean spring-boot:run
```

*(On Windows Command Prompt: `mvnw.cmd clean spring-boot:run`)*

### 2. Access the Application

- **Frontend Dashboard:** [http://localhost:8081](http://localhost:8081)
- **REST API Base URL:** [http://localhost:8081/api](http://localhost:8081/api)

---

## 🌐 REST API Endpoints

### 📁 Projects (`/api/projects`)
- `GET /api/projects` - Get all projects with milestones
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/{id}` - Update project details
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/stats` - Get summary metrics (total projects, active projects, total budget, total released)

### 🚩 Milestones (`/api/milestones`)
- `GET /api/milestones` - Get all milestones
- `GET /api/milestones/{id}` - Get milestone by ID
- `GET /api/milestones/project/{projectId}` - Get all milestones for a project
- `POST /api/milestones/project/{projectId}` - Add a new milestone
- `PUT /api/milestones/{id}` - Update milestone details
- `PATCH /api/milestones/{id}/start` - Set status to `IN_PROGRESS`
- `PATCH /api/milestones/{id}/complete` - Set status to `COMPLETED`
- `DELETE /api/milestones/{id}` - Delete milestone

### 💰 Releases (`/api/releases`)
- `POST /api/releases/{milestoneId}/release` - Release payment from escrow (only allowed when milestone status is `COMPLETED`)
- `GET /api/releases` - Get all release transaction records
- `GET /api/releases/milestone/{milestoneId}` - Get release record for a specific milestone
