# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user.
```json
{
  "request": {
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "role": "string"
  },
  "response": {
    "userId": "integer",
    "token": "string",
    "message": "string"
  }
}
```

### POST /api/auth/login
Authenticate a user.
```json
{
  "request": {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean"
  },
  "response": {
    "token": "string",
    "refreshToken": "string",
    "expiresIn": "integer"
  }
}
```

## Lecture Endpoints

### GET /api/lectures
Get list of lectures.
```json
{
  "parameters": {
    "page": "integer",
    "pageSize": "integer",
    "status": "string",
    "teacherId": "integer?"
  },
  "response": {
    "items": [
      {
        "id": "integer",
        "title": "string",
        "description": "string",
        "teacherName": "string",
        "status": "string",
        "createdDate": "datetime"
      }
    ],
    "totalCount": "integer",
    "pageCount": "integer"
  }
}
```

### POST /api/lectures
Create new lecture.
```json
{
  "request": {
    "title": "string",
    "description": "string",
    "status": "string"
  },
  "response": {
    "lectureId": "integer",
    "message": "string"
  }
}
```

## Drawing Endpoints

### POST /api/lectures/{id}/drawing
Save drawing data.
```json
{
  "request": {
    "drawingData": "object",
    "timestamp": "datetime"
  },
  "response": {
    "drawingId": "integer",
    "status": "string"
  }
}
```

### GET /api/lectures/{id}/drawing
Get drawing data.
```json
{
  "response": {
    "drawingId": "integer",
    "drawingData": "object",
    "createdDate": "datetime",
    "updatedDate": "datetime"
  }
}
```

## Animation Endpoints

### POST /api/lectures/{id}/animation
Save animation data.
```json
{
  "request": {
    "animationData": "object",
    "duration": "integer"
  },
  "response": {
    "animationId": "integer",
    "status": "string"
  }
}
```

### GET /api/lectures/{id}/animation
Get animation data.
```json
{
  "response": {
    "animationId": "integer",
    "animationData": "object",
    "duration": "integer",
    "createdDate": "datetime"
  }
}
```

## Error Responses
All endpoints may return these error responses:
```json
{
  "400": {
    "message": "Bad Request",
    "errors": ["Validation errors"]
  },
  "401": {
    "message": "Unauthorized",
    "error": "Authentication required"
  },
  "403": {
    "message": "Forbidden",
    "error": "Insufficient permissions"
  },
  "404": {
    "message": "Not Found",
    "error": "Resource not found"
  },
  "500": {
    "message": "Internal Server Error",
    "error": "Server error message"
  }
}
```

## Authentication
All endpoints except `/api/auth/*` require JWT authentication:
```http
Authorization: Bearer {token}
```

## Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Versioning
Current version: v1
```http
Accept: application/json; version=1.0
``` 