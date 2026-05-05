# Operational Risk Event Collector

A full-stack application for collecting, managing, and analyzing operational risk events. Features a Spring Boot backend, a React frontend, and an AI-powered microservice (Flask) for event analysis.

## Architecture

- **Frontend**: React + Vite, Tailwind CSS, Axios, Recharts
- **Backend**: Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL, Spring AOP (Audit Logging)
- **AI Service**: Flask, Groq API
- **Infrastructure**: Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Java 17+ (for local backend development)
- Python 3.10+ (for local AI service development)

## Setup Instructions

1. Copy `.env.example` to `.env` and fill in your details, specifically the `GROQ_API_KEY`.
2. Run `docker-compose up --build` to start all services.
3. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend Swagger UI: `http://localhost:8080/swagger-ui.html`
   - AI Service: `http://localhost:5000`

## Features

- Complete CRUD for Risk Events
- Audit Logging via Spring AOP
- Real-time AI analysis of event descriptions
- CSV Export and File Upload support
- Dashboard with KPI metrics and Recharts visualizations
- Responsive UI design
