# Admin Authentication Setup

This document explains how to set up and use the admin authentication system.

## Setup Instructions

1. **Create the database tables**
   Run the database setup script to create the necessary tables:
   ```bash
   node src/db/setup.js
   ```

2. **Create an admin user**
   Run the following command to create an initial admin user:
   ```bash
   node scripts/createAdmin.js
   ```
   Default credentials:
   - Username: admin
   - Password: admin123

   **Important**: Change the default password after first login!

## API Endpoints

### Login
- **URL**: `POST /api/admin/auth/login`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "your-password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt-token-here",
    "admin": {
      "id": 1,
      "username": "admin",
      "createdAt": "2025-10-08T14:30:00Z"
    }
  }
  ```

### Verify Token
- **URL**: `GET /api/admin/auth/verify`
- **Headers**:
  ```
  Authorization: Bearer your-jwt-token
  ```
- **Response**:
  ```json
  {
    "success": true,
    "admin": {
      "id": 1,
      "username": "admin",
      "createdAt": "2025-10-08T14:30:00Z"
    }
  }
  ```

## Frontend Integration

The frontend is already set up to work with this authentication system. It will:
1. Automatically redirect unauthenticated users to the login page
2. Store the JWT token in localStorage
3. Include the token in the Authorization header for subsequent requests
4. Handle token expiration

## Security Notes

1. **Environment Variables**:
   - Set a strong `JWT_SECRET` in your `.env` file
   - Never commit sensitive information to version control

2. **Password Security**:
   - Passwords are hashed using bcrypt before being stored
   - The system uses JWT for stateless authentication

3. **Production Deployment**:
   - Always use HTTPS in production
   - Consider implementing rate limiting
   - Set appropriate CORS policies
   - Keep dependencies updated
