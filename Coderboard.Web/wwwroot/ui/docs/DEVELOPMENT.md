# Development Setup Guide

## Prerequisites
1. **.NET Core SDK 8.0**
   - Download from: https://dotnet.microsoft.com/download
   - Verify installation: `dotnet --version`

2. **SQL Server**
   - Download SQL Server Express or Developer Edition
   - Install SQL Server Management Studio (SSMS)

3. **Visual Studio 2022** or **VS Code**
   - Required extensions:
     * C# Dev Kit
     * ASP.NET Core Debugger
     * SQL Server tools

4. **Node.js and npm**
   - For frontend development tools
   - Download from: https://nodejs.org/

## Initial Setup

### 1. Clone Repository
```bash
git clone [repository-url]
cd Coderboard
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE CoderboardDB;
GO

-- Apply migrations
dotnet ef database update
```

### 3. Configuration
Create `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CoderboardDB;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "JWT": {
    "Secret": "your-development-secret-key",
    "Issuer": "coderboard",
    "Audience": "coderboard-client",
    "ExpiryInDays": 7
  }
}
```

### 4. Install Dependencies
```bash
# Restore .NET packages
dotnet restore

# Install npm packages
cd Coderboard.Web/wwwroot
npm install
```

## Running the Application

### Development Environment
```bash
# Run the application
dotnet run --project Coderboard.Web

# Watch for changes
dotnet watch run --project Coderboard.Web
```

### Visual Studio
1. Set Coderboard.Web as startup project
2. Press F5 to start debugging

## Development Workflow

### 1. Database Migrations
```bash
# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

### 2. Running Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test Coderboard.Tests
```

### 3. Code Style
```bash
# Run code formatting
dotnet format

# Run static code analysis
dotnet analyze
```

## Project Structure
```
📦 Coderboard
├── 📂 src
│   ├── Coderboard.Web
│   ├── Coderboard.Core
│   ├── Coderboard.Infrastructure
│   └── Coderboard.Shared
├── 📂 tests
│   ├── Coderboard.UnitTests
│   └── Coderboard.IntegrationTests
└── 📂 docs
```

## Development Tools

### Visual Studio Code Extensions
- C# Dev Kit
- ASP.NET Core Debugger
- SQL Server
- GitLens
- Prettier
- ESLint

### Browser Extensions
- Redux DevTools
- React Developer Tools
- ASP.NET Core Debug Visualizer

## Debugging

### Backend Debugging
1. Set breakpoints in C# code
2. Use Watch window for variables
3. SQL Server profiler for database queries

### Frontend Debugging
1. Browser Developer Tools
2. JavaScript console
3. Network tab for API calls

## Common Issues

### Database Connection
```bash
# Verify connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your-connection-string"

# Update database
dotnet ef database update
```

### Package Restore
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore packages
dotnet restore
```

## Deployment

### Development
```bash
# Build application
dotnet build

# Run in development
dotnet run --environment Development
```

### Staging
```bash
# Publish application
dotnet publish -c Release

# Run in staging
dotnet run --environment Staging
``` 