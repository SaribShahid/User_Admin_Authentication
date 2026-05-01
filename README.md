# User Authentication & Role-Based Access Control System

A secure, scalable backend authentication and authorization system built with Node.js, Express.js, MongoDB, and JWT. The system implements a 3-tier Role-Based Access Control (SuperAdmin → Admin → User) with production-level security practices including refresh token rotation, audit logging, and middleware-based route protection.

---

## Overview

This project is a complete backend authentication system designed with scalability and security in mind. It provides:

- Secure user authentication (register/login)
- Role-Based Access Control (RBAC)
- JWT-based authentication with access and refresh tokens
- Secure middleware-based route protection
- Audit logging with IP tracking
- Production-ready backend architecture

---

## System Architecture

Client Request → Express Server → Authentication Middleware → Role Authorization Middleware → Protected Routes → MongoDB Database

---

## Role Hierarchy

Each role has controlled access to specific API endpoints. Access is enforced using middleware validation.

---

## Features

### Authentication System
- User registration and login system
- JWT access token and refresh token implementation
- Secure session handling
- Token-based stateless authentication

### Security Features
- Password hashing using bcrypt
- Refresh token rotation mechanism
- IP address logging for security tracking
- Verification token support for account validation

### Role-Based Access Control
- 3-tier hierarchical role system
- Middleware-based authorization
- Route-level access control
- Secure endpoint protection

### Audit Logging System
- Tracks user login and actions
- Stores IP addresses
- Records timestamps of activities
- Maintains security history logs

### API Design
- RESTful API architecture
- Modular route structure
- 5 secured route groups
- Scalable backend design

---

## Tech Stack

- Node.js (Runtime Environment)
- Express.js (Backend Framework)
- MongoDB (Database)
- Mongoose (ODM)
- JSON Web Token (Authentication)
- bcrypt (Password Hashing)

---

## Database Design

### Users Collection

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "hashed string (bcrypt)",
  "role": "admin | user | superadmin",
  "refreshToken": "JWT refresh token",
  "isVerified": "boolean",
  "verificationToken": "string",
  "__v": 0
}
```
### ctivity Logs Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (reference to User)",
  "action": "string (e.g., User Logged In)",
  "ipAddress": "string",
  "userAgent": "string",
  "timestamp": "ISODate",
  "__v": 0
}
```
## Middleware Flow

Request → Authentication Middleware → Role Authorization Middleware → Route Handler → Response

- Authentication Middleware: Verifies JWT token  
- Authorization Middleware: Checks user role permissions  
- Route Handler: Executes protected business logic  

---

## Project Structure

```text
/controllers
/middlewares
/models
/routes
/config
/utils
/server.js
```
## Security Highlights

- JWT-based authentication (Access and Refresh Tokens)  
- bcrypt password hashing for secure storage  
- Refresh token rotation for session security  
- IP tracking for audit logs  
- Role-based route protection  
- Middleware-first architecture  

---

## API Security Flow

- User logs in and receives JWT tokens  
- Access token is used for API requests  
- Middleware verifies token validity  
- Role middleware checks permissions  
- Request is allowed or denied based on role  

---

## Project Timeline

- System Design and ERD Planning  
- Database Schema Design  
- Backend API Development  
- Authentication and JWT Implementation  
- Role-Based Access Control Integration  
- Testing and Debugging  
- Completed in 6 Weeks  

---

## Project Outcome

- Production-style backend authentication system  
- Secure and scalable RBAC architecture  
- Clean modular code structure  
- Industry-level security implementation  
- Fully functional REST API backend  

---

## Author

Sarib Shahid  
Backend Developer | Node.js | Express.js | MongoDB | JWT Systems
