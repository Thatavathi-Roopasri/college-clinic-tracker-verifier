# 📝 Student Signup & Login System

## Overview

This system allows **new students** to sign up with their email and password, which gets stored securely in MongoDB. When they login, the system verifies their credentials.

---

## Features

### ✅ **Signup Features**
- New users can register with email and password
- Password validation (minimum 6 characters)
- Email validation (unique, valid format)
- Password strength indicator
- Role selection (Student, Faculty, Clinic Staff, HOD)
- Passwords are **hashed with BCrypt** before storage in MongoDB
- Real-time error messages

### ✅ **Login Features**
- Email/password authentication
- Secure password verification against hashed password in MongoDB
- JWT token generation for subsequent requests
- User profile information returned
- Account status check (active/inactive)
- Remember login state with localStorage

### ✅ **Security**
- Passwords never stored in plain text
- BCrypt hashing (industry standard)
- Email uniqueness constraint
- Input validation
- CORS enabled for frontend communication

---

## API Endpoints

### 1. **User Signup**
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "student@klh.edu.in",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "student"
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011",
  "email": "student@klh.edu.in",
  "name": "John Doe",
  "role": "student"
}
```

**Response (Error - 409):**
```json
{
  "error": "Email already registered. Please login or use a different email."
}
```

**Response (Error - 400):**
```json
{
  "error": "Password must be at least 6 characters long"
}
```

---

### 2. **User Login**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "student@klh.edu.in",
  "password": "SecurePass123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "token": "NTA3ZjFmNzdiY2Y4NmNkNzk5NDM5MDEx",
  "userId": "507f1f77bcf86cd799439011",
  "email": "student@klh.edu.in",
  "name": "John Doe",
  "role": "student"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. **Get User Profile**
```
GET /api/auth/profile/{userId}
```

**Response (Success - 200):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "student@klh.edu.in",
  "name": "John Doe",
  "role": "student",
  "active": true
}
```

---

### 4. **Change Password**
```
PUT /api/auth/change-password
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## HTML Login/Signup Page

A complete HTML page is provided at: **`login-signup.html`**

### Features:
- ✅ Beautiful responsive design
- ✅ Smooth animations
- ✅ Password strength indicator
- ✅ Real-time form validation
- ✅ Role selection (Student, Faculty, etc.)
- ✅ Error/Success messages
- ✅ Loading states
- ✅ Toggle between Login and Signup forms

### How to Use:
1. Open **`login-signup.html`** in a browser
2. New users click **"Create Account"**
3. Fill in details and select role
4. Click **"Create Account"**
5. Email & password stored in MongoDB with BCrypt hashing
6. Existing users click **"Sign In"**
7. Enter email and password
8. System verifies against MongoDB
9. Login successful → Redirected to dashboard

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser/Frontend                         │
│  (login-signup.html)                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │ 1. User submits signup form
                   │ (email, password, name, role)
                   ↓
┌──────────────────────────────────────────────────────────────┐
│              POST /api/auth/signup                           │
│              SignupController                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Validate email format                            │  │
│  │ 2. Check if email already exists in MongoDB         │  │
│  │ 3. Hash password with BCrypt                        │  │
│  │ 4. Create User object                               │  │
│  │ 5. Save to MongoDB (users collection)               │  │
│  │ 6. Return success with userId                       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ 2. Response with userId
                   │ (message, userId, email, name, role)
                   ↓
        ┌──────────────────────┐
        │ Data Stored MongoDB  │
        │ ┌──────────────────┐ │
        │ │ {                │ │
        │ │  _id: "...",     │ │
        │ │  email: "...",   │ │
        │ │  password: "..." │ │ ← Hashed!
        │ │  name: "...",    │ │
        │ │  role: "...",    │ │
        │ │  active: true    │ │
        │ │ }                │ │
        │ └──────────────────┘ │
        └──────────────────────┘

═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    Browser/Frontend                         │
│  User clicks "Sign In" and enters credentials              │
└──────────────────┬──────────────────────────────────────────┘
                   │ 3. User submits login form
                   │ (email, password)
                   ↓
┌──────────────────────────────────────────────────────────────┐
│              POST /api/auth/login                            │
│              SignupController                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Find user by email in MongoDB                    │  │
│  │ 2. Check if user exists                            │  │
│  │ 3. Check if account is active                      │  │
│  │ 4. Compare entered password with stored hash       │  │
│  │    (BCrypt passwordEncoder.matches())              │  │
│  │ 5. Generate JWT token                              │  │
│  │ 6. Return token + user info                        │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ 4. Response with JWT token
                   │ (token, userId, email, name, role)
                   ↓
        ┌──────────────────────┐
        │ Frontend Stores      │
        │ localStorage:        │
        │ • authToken          │
        │ • userId             │
        │ • userName           │
        │ • userRole           │
        └──────────────────────┘
```

---

## MongoDB Collection Structure

### Users Collection: `users`

```javascript
{
  "_id": ObjectId("..."),
  "email": "student@klh.edu.in",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm", // Hashed
  "name": "John Doe",
  "role": "student",  // student | faculty | clinic | hod | admin
  "active": true,
  "_class": "com.example.clinicserver.model.User"
}
```

**Database Indexes:**
- `email` (unique)
- `role` (for filtering)

---

## Test Student Credentials (Pre-Seeded)

These students are automatically created when the application starts:

| Email | Password | Name | Role |
|-------|----------|------|------|
| `241003001@klh.edu.in` | `241003001` | Swathi | Student |
| `241003002@klh.edu.in` | `241003002` | Rahul | Student |
| `student1@klh.edu.in` | `student123` | Student One | Student |
| `student2@klh.edu.in` | `student456` | Student Two | Student |
| `student3@klh.edu.in` | `student789` | Student Three | Student |
| `student4@klh.edu.in` | `student101` | Student Four | Student |

---

## Testing with cURL

### Test Signup
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@klh.edu.in",
    "password": "MyPassword123",
    "name": "New Student",
    "role": "student"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@klh.edu.in",
    "password": "MyPassword123"
  }'
```

### Test Get Profile
```bash
curl -X GET http://localhost:8080/api/auth/profile/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Change Password
```bash
curl -X PUT http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "oldPassword": "MyPassword123",
    "newPassword": "NewPassword456"
  }'
```

---

## Validation Rules

### Email Validation
- ✅ Must be valid email format: `user@domain.com`
- ✅ Must be unique (no duplicates in database)
- ✅ Case-insensitive matching

### Password Validation
- ✅ Minimum 6 characters
- ✅ Stored as BCrypt hash (never plain text)
- ✅ No special requirements (but UI shows strength indicator)

### Name Validation
- ✅ Cannot be empty
- ✅ Max 100 characters

### Role Validation
- ✅ `student` (default for signup)
- ✅ `faculty`
- ✅ `clinic`
- ✅ `hod`
- ✅ `admin` (requires special permission)

---

## Security Features

### ✅ Password Security
```java
// BCrypt hashing (configured in SignupController)
private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

// Hashing on signup
user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

// Verification on login
passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())
```

### ✅ Email Uniqueness
```
@Indexed(unique = true)
private String email;
```

### ✅ Account Status
- Can be set to inactive
- Login checks if account is active
- Inactive users get "Account is disabled" error

### ✅ Error Messages
- Never reveal if email exists (generic "Invalid email or password")
- Prevents user enumeration attacks

---

## Frontend Implementation

### Login/Signup HTML Page
Located at: **`login-signup.html`**

**Features:**
- Beautiful gradient background
- Smooth form transitions
- Password strength meter
- Role selector
- Real-time validation
- Error/Success alerts
- Loading spinner
- Responsive design (mobile-friendly)

---

## Integration Steps

### 1. **Build Project**
```powershell
cd server-java
mvn clean install
```

### 2. **Start Application**
```powershell
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

### 3. **Open Login Page**
```
http://localhost/login-signup.html
```

### 4. **Signup New Student**
- Click "Create Account"
- Fill email: `newstudent@example.com`
- Enter password: `SecurePass123`
- Select role: "Student"
- Click "Create Account"
- Automatically saved to MongoDB

### 5. **Login as New Student**
- Click "Sign In"
- Enter same email and password
- System verifies against MongoDB
- Receive JWT token
- Redirected to dashboard

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Email exists in DB | Use different email or login |
| "Invalid email format" | Bad email format | Enter valid email with @ |
| "Password must be at least 6 characters" | Too short | Enter 6+ character password |
| "Passwords do not match" | Mismatch | Confirm password matches |
| "Invalid email or password" | Wrong credentials | Check email/password |
| "Account is disabled" | Account inactive | Contact admin |
| "User not found" | Email not in DB | Signup first |
| "Network error" | Connection issue | Check internet/server |

---

## Data Privacy

✅ **What's Stored:**
- Email (for login)
- Hashed Password (BCrypt)
- Name
- Role
- Active status

❌ **What's NOT Stored:**
- Plain text passwords
- Sensitive documents
- Credit card info
- Medical records (separate system)

---

## Next Steps

1. ✅ **Update User model** - Add `password` and `active` fields
2. ✅ **Create SignupController** - Signup & login endpoints
3. ✅ **Create login-signup.html** - Beautiful UI
4. ✅ **Update UserRepository** - Add `findByEmail()` method
5. ⏭️ **Rebuild project** - Run `mvn clean install`
6. ⏭️ **Test endpoints** - Use cURL or Postman
7. ⏭️ **Deploy** - Start application and test UI

---

**Status:** ✅ Ready to rebuild and test!
