# 🔐 Test Login Credentials

This document contains all the test user credentials created in the MongoDB database for testing the Multi-Portal Clinic Tracker system.

## Quick Reference Table

| Email | Password | Role | Portal | Full Name |
|-------|----------|------|--------|-----------|
| `admin@clinic.edu.in` | `admin123` | Admin | Admin Portal | Admin User |
| `superadmin@clinic.edu.in` | `superadmin123` | Admin | Admin Portal | Super Admin |
| `hod@clinic.edu.in` | `hod123` | HOD | HOD Portal | Head of Department |
| `hod2@clinic.edu.in` | `hod2123` | HOD | HOD Portal | HOD Science |
| `faculty1@klh.edu.in` | `faculty123` | Faculty | Faculty Portal | Dr. Rajesh Kumar |
| `faculty2@klh.edu.in` | `faculty456` | Faculty | Faculty Portal | Dr. Priya Sharma |
| `doctor@clinic.edu.in` | `doctor123` | Faculty | Faculty Portal | Dr. Amit Singh |
| `clinic_staff@clinic.edu.in` | `clinic123` | Clinic | Clinic Portal | Clinic Staff Member |
| `nurse@clinic.edu.in` | `nurse123` | Clinic | Clinic Portal | Nurse Sharma |
| `241003001@klh.edu.in` | `241003001` | Student | Student Portal | Swathi |
| `241003002@klh.edu.in` | `241003002` | Student | Student Portal | Rahul |
| `student1@klh.edu.in` | `student123` | Student | Student Portal | Student One |
| `student2@klh.edu.in` | `student456` | Student | Student Portal | Student Two |
| `student3@klh.edu.in` | `student789` | Student | Student Portal | Student Three |
| `student4@klh.edu.in` | `student101` | Student | Student Portal | Student Four |

---

## Portal Access Matrix

### 1. **Admin Portal** (`admin`)
Access Level: Full System Control
- `admin@clinic.edu.in` / `admin123`
- `superadmin@clinic.edu.in` / `superadmin123`

**Permissions:**
- Create/Edit/Delete portals
- Manage all users across portals
- View all gate passes and letters
- System-wide reporting and analytics

---

### 2. **HOD Portal** (`hod`)
Access Level: Department Management
- `hod@clinic.edu.in` / `hod123`
- `hod2@clinic.edu.in` / `hod2123`

**Permissions:**
- Manage faculty and students in their department
- Approve letters and gate passes
- View department reports
- Manage section assignments

---

### 3. **Faculty Portal** (`faculty`)
Access Level: Classroom & Student Management
- `faculty1@klh.edu.in` / `faculty123` (Dr. Rajesh Kumar)
- `faculty2@klh.edu.in` / `faculty456` (Dr. Priya Sharma)
- `doctor@clinic.edu.in` / `doctor123` (Dr. Amit Singh)

**Permissions:**
- Issue gate passes to students
- Request letters for students
- View assigned students
- Track student attendance

---

### 4. **Clinic Portal** (`clinic`)
Access Level: Health Services Management
- `clinic_staff@clinic.edu.in` / `clinic123`
- `nurse@clinic.edu.in` / `nurse123`

**Permissions:**
- Manage clinic visits and health records
- Issue health-related letters
- Track medical gate passes
- Manage clinic inventory

---

### 5. **Student Portal** (`student`)
Access Level: Personal & Academic Services
- `241003001@klh.edu.in` / `241003001` (Swathi)
- `241003002@klh.edu.in` / `241003002` (Rahul)
- `student1@klh.edu.in` / `student123`
- `student2@klh.edu.in` / `student456`
- `student3@klh.edu.in` / `student789`
- `student4@klh.edu.in` / `student101`

**Permissions:**
- View personal gate passes
- View issued letters
- Request letters from faculty
- Acknowledge received letters
- View attendance records

---

## Testing Workflows

### Test Case 1: Admin Login & Portal Creation
```bash
# Step 1: Login as Admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.edu.in",
    "password": "admin123"
  }'

# Response: { "token": "jwt_token_here", "role": "admin" }
```

### Test Case 2: Faculty Issues Gate Pass
```bash
# Step 1: Faculty Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty1@klh.edu.in",
    "password": "faculty123"
  }'

# Step 2: Issue Gate Pass to Student
curl -X POST http://localhost:8080/api/gatepasses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token_here" \
  -d '{
    "userId": "241003001@klh.edu.in",
    "portalId": "student_portal_id",
    "sectionId": "section_id",
    "issuerUserId": "faculty1@klh.edu.in"
  }'
```

### Test Case 3: Student Receives Letter
```bash
# Step 1: HOD Issues Letter
curl -X POST http://localhost:8080/api/letters/issue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hod_jwt_token" \
  -d '{
    "userId": "241003001@klh.edu.in",
    "letterType": "conduct_certificate",
    "title": "Conduct Certificate",
    "content": "Certificate for good conduct",
    "issuerUserId": "hod@clinic.edu.in"
  }'

# Step 2: Student Acknowledges Letter
curl -X POST http://localhost:8080/api/letters/{letter_id}/acknowledge \
  -H "Authorization: Bearer student_jwt_token"
```

---

## Password Security Notes

- All passwords are **hashed using BCrypt** before storage in MongoDB
- Plaintext passwords shown here are for **testing only**
- In production, use strong passwords and never share credentials
- Change default passwords immediately after initial setup

---

## First Time Setup

To populate the database with these test users:

1. **Build the application:**
   ```bash
   cd c:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java
   mvn clean install
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

3. **The SeedDatabase class will automatically:**
   - Check if database is empty
   - Create all 15 test users
   - Create 5 portal configurations
   - Assign users to respective portals

4. **Monitor startup logs:**
   ```
   ✅ 15 users created successfully!
   ✅ 5 portals created successfully!
   ```

---

## Useful Tips

### Testing with Postman
1. Create a POST request to `http://localhost:8080/api/auth/login`
2. Use one of the credential pairs from the table above
3. Copy the JWT token from response
4. Add to Authorization header: `Bearer {jwt_token}`
5. Test other endpoints with authenticated requests

### Testing with cURL
```bash
# Store token in variable
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.edu.in",
    "password": "admin123"
  }' | jq -r '.token')

# Use token in subsequent requests
curl -X GET http://localhost:8080/api/portals \
  -H "Authorization: Bearer $TOKEN"
```

### MongoDB Verification
```bash
# Connect to MongoDB Atlas
# User: Project01
# Pass: Welcome12345

# Check users collection
db.users.find({}, { email: 1, role: 1, name: 1 }).pretty()

# Check portals collection
db.portals.find({}, { name: 1, portalType: 1, userIds: 1 }).pretty()
```

---

## Role Hierarchy & Permissions

```
┌─────────────────┐
│   SUPERADMIN    │  ← superadmin@clinic.edu.in / superadmin123
│  Full Access    │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬─────────┬─────────┐
    │           │          │         │         │
┌───▼──┐ ┌────▼───┐ ┌────▼──┐ ┌───▼────┐ ┌─▼──────┐
│ADMIN │ │  HOD   │ │FACULTY│ │CLINIC  │ │STUDENT │
└──────┘ └────────┘ └───────┘ └────────┘ └────────┘
```

---

## Troubleshooting Login Issues

**"Invalid credentials" error:**
- Verify email spelling (case-sensitive)
- Check password is correct from table
- Ensure user exists in database
- Try with admin account first

**"User not found" error:**
- Verify database seeding completed
- Check MongoDB Atlas connection
- Ensure SeedDatabase class ran on startup
- Check logs for `✅ users created successfully!`

**"Unauthorized" error:**
- Missing or incorrect JWT token in header
- Token has expired (default 24 hours)
- Login again to get new token

---

## Next Steps

1. ✅ Start the application (`mvn spring-boot:run`)
2. ✅ Verify users are seeded (check MongoDB)
3. ✅ Test login with admin credentials
4. ✅ Test portal access for different roles
5. ✅ Create gate passes and letters
6. ✅ Test complete workflows

---

**Last Updated:** October 30, 2025  
**Status:** Ready for Testing  
**Database:** MongoDB Atlas (clinicdb)
