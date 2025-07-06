# Shift Scheduler

Shift Scheduler is a full-stack application designed to assist in staff shift planning and optimization. It provides a modern frontend interface for uploading and reviewing employee and shift data, and a backend that supports both greedy and ILP (Integer Linear Programming) optimization strategies to assign employees to shifts based on skill, availability, and working hour constraints.

## Project Structure

shift-scheduler/
├── backend/ # FastAPI backend and optimization logic
├── frontend/ # React + TypeScript frontend
├── Dockerfile # Backend Dockerfile
├── docker-compose.yml # Compose setup for frontend and backend


## Technologies Used

- **Frontend**: React, TypeScript, PapaParse
- **Backend**: FastAPI, Python, PuLP
- **DevOps**: Docker, Docker Compose

## Getting Started

### Prerequisites

Ensure the following are installed on your system:
- Docker
- Docker Compose

### Running the Application

To build and start both frontend and backend services, run the following command from the project root:

```bash
docker compose up --build

The application will be accessible at:

Frontend: http://localhost:3000

Backend: http://localhost:8000

Features
Upload employees and shifts via CSV files

Run a greedy scheduling algorithm or ILP optimization

Ensure constraints such as skills, availability, and working hours are met

Export final shift assignments to a downloadable CSV file

Prevents scheduling conflicts such as overlapping shifts

Backend exposes a POST API endpoint at /api/schedule/optimize

ILP Optimization Details
The ILP model is implemented in backend/optimizer.py and includes the following:

Objective: Minimize total number of assigned shifts (can be extended to minimize overtime)

Constraints:

Each shift is assigned to exactly one employee

No overlapping shifts for a given employee

Employees do not exceed their maximum allowed hours

Employees only receive shifts for which they have the required skill

Folder Overview
frontend/: Contains the React client app, including a CSV uploader, local greedy scheduler, and interface to the backend

backend/: FastAPI-based service that handles optimization and routes

Dockerfile: Builds the backend service

frontend/Dockerfile: Builds the React frontend

docker-compose.yml: Orchestrates both services

Suggested Improvements
Implement authentication and user roles

Store uploaded shift/employee data in a database

Add calendar or Gantt chart visualization for shift assignments

Deploy frontend and backend using a CI/CD pipeline

Author
Mohamed Yasser
Internship Project — Progressio
July 2025

License
This project is licensed under the MIT License.


---

Let me know if you want this as a downloadable `.md` file or need help with versioning, commit messages, or final GitHub setup.
