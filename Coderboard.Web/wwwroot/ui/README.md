# Interactive Online Training Course Platform - MVP

## Overview
A web application for creating and viewing interactive drawing-based lectures.

## Core Features
1. **Teachers can:**
   - Create lectures with basic info
   - Draw on canvas
   - Record drawing process
   - Publish lectures

2. **Students can:**
   - View available lectures
   - Watch drawing animations

## Tech Stack
- Frontend: ASP.NET Core Razor Pages
- Backend: ASP.NET Core Web API
- Database: SQL Server
- Authentication: Basic JWT

## Project Structure
```
📦 Coderboard
├── Pages/
│   ├── Auth/         # Login, Register
│   ├── Teacher/      # Lecture management, Drawing
│   └── Student/      # Lecture viewing
├── Services/         # Business logic
└── Data/            # Database context
```

## Setup Guide

### Prerequisites
- .NET Core SDK 8.0
- SQL Server Express/LocalDB
- Visual Studio 2022 or VS Code

### Quick Start
1. **Create Database**
```sql
CREATE DATABASE CoderboardDB;
```

2. **Configure Settings**
Create `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CoderboardDB;Trusted_Connection=True"
  },
  "JWT": {
    "Secret": "your-development-secret-key"
  }
}
```

3. **Run Application**
```bash
dotnet restore
dotnet ef database update
dotnet run
```

## API Endpoints
```
Auth:
POST /api/auth/register
POST /api/auth/login

Lectures:
GET  /api/lectures
POST /api/lectures
GET  /api/lectures/{id}
POST /api/lectures/{id}/drawing
GET  /api/lectures/{id}/animation
``` 