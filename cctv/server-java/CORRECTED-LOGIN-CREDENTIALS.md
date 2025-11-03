# ✅ UPDATED LOGIN CREDENTIALS - ALL @klh.edu.in

**Status:** ✅ **CORRECTED AND REBUILT**  
**All emails now use: `@klh.edu.in` suffix only**  
**Build completed successfully!**

---

## 🎓 Student Login Credentials

| Email | Password | Name |
|-------|----------|------|
| `241003001@klh.edu.in` | `241003001` | Swathi |
| `241003002@klh.edu.in` | `241003002` | Rahul |
| `student1@klh.edu.in` | `student123` | Student One |
| `student2@klh.edu.in` | `student456` | Student Two |
| `student3@klh.edu.in` | `student789` | Student Three |
| `student4@klh.edu.in` | `student101` | Student Four |

---

## 👨‍💼 Admin Credentials

| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@klh.edu.in` | `admin123` | Admin | Admin User |
| `superadmin@klh.edu.in` | `superadmin123` | Admin | Super Admin |

---

## 👨‍🏫 Faculty Credentials

| Email | Password | Role | Name |
|-------|----------|------|------|
| `faculty1@klh.edu.in` | `faculty123` | Faculty | Dr. Rajesh Kumar |
| `faculty2@klh.edu.in` | `faculty456` | Faculty | Dr. Priya Sharma |
| `doctor@klh.edu.in` | `doctor123` | Faculty | Dr. Amit Singh |

---

## 🏥 Clinic Staff Credentials

| Email | Password | Role | Name |
|-------|----------|------|------|
| `clinic_staff@klh.edu.in` | `clinic123` | Clinic | Clinic Staff Member |
| `nurse@klh.edu.in` | `nurse123` | Clinic | Nurse Sharma |

---

## 👔 HOD Credentials

| Email | Password | Role | Name |
|-------|----------|------|------|
| `hod@klh.edu.in` | `hod123` | HOD | Head of Department |
| `hod2@klh.edu.in` | `hod2123` | HOD | HOD Science |

---

## 🚀 How to Start & Login

### Step 1: Start the Application
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
$env:Path = "$env:JAVA_HOME\bin;C:\apache-maven\apache-maven-3.9.11\bin;$env:Path"
$env:MONGO_URI = "mongodb+srv://Project01:Welcome12345@project01.bmejhvq.mongodb.net/clinicdb?retryWrites=true&w=majority"

cd "c:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java"
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

### Step 2: Application Will Show
```
✅ 15 users created successfully!
✅ 5 portals created successfully!
Started ClinicServerApplication in X.XXX seconds
Tomcat started on port(s): 8080
```

### Step 3: Open Browser
```
http://localhost:8080
```

### Step 4: Login with Student Credentials
- **Email:** `241003001@klh.edu.in`
- **Password:** `241003001`
- **Click Sign In** ✅

---

## 📝 Sign Up for New Students

If you're a **new student**, click **"Sign up"** instead:

1. Click the signup link
2. Enter:
   - **Email:** (must end with @klh.edu.in)
   - **Password:** Your password
   - **Name:** Your full name
3. Click **Sign Up**
4. Your account is saved to MongoDB
5. You can now login!

---

## ✨ What Changed

✅ **All emails standardized to `@klh.edu.in`**
- Before: Mixed `@clinic.edu.in` and `@klh.edu.in`
- Now: **ONLY `@klh.edu.in`** everywhere

✅ **Fixed Authentication Service**
- Now validates all emails must end with `@klh.edu.in`
- Rejects any other domain

✅ **Rebuilt Application**
- All 32 Java files compiled successfully
- New JAR file created with corrected credentials
- All 15 users auto-seeded on first run

---

## 🧪 Test Login Endpoint (cURL)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"241003001@klh.edu.in",
    "password":"241003001",
    "role":"student"
  }'
```

**Response (Success):**
```json
{
  "id": "student123id",
  "email": "241003001@klh.edu.in",
  "role": "student",
  "name": "Swathi",
  "active": true
}
```

---

## 📊 Build Status

| Component | Status |
|-----------|--------|
| Compilation | ✅ SUCCESS (32 files) |
| JAR Creation | ✅ SUCCESS (28.16 MB) |
| All Emails | ✅ @klh.edu.in only |
| Database | ✅ MongoDB Ready |
| Authentication | ✅ Fixed |
| Test Users | ✅ 15 pre-seeded |

---

## 🔍 MongoDB Collections

When you login, these collections are ready:

1. **users** - 15 seeded users (all @klh.edu.in)
2. **portals** - 5 portal configs (admin, hod, faculty, clinic, student)
3. **gatepasses** - Ready for gate pass creation
4. **letters** - Ready for letter workflows
5. **sections** - Department sections
6. **visits** - Clinic visits
7. **attendance** - Attendance records

---

## ⚠️ Important Notes

- ✅ **Only @klh.edu.in emails are allowed** (enforced by system)
- ✅ **All passwords are hashed with BCrypt** (never stored in plain text)
- ✅ **New signups must also use @klh.edu.in** domain
- ✅ **Credentials are case-insensitive for emails**

---

## ❓ Troubleshooting

**"Invalid credentials" error?**
- Check email is exactly: `241003001@klh.edu.in`
- Check password is exactly: `241003001`
- Ensure role is: `student`

**"Only @klh.edu.in email addresses are allowed"?**
- You tried logging in with wrong domain
- Use only emails ending in `@klh.edu.in`

**Can't start the application?**
- Check MongoDB URI environment variable is set
- Verify Java is installed: `java -version`
- Ensure port 8080 is not in use

---

**Ready to Login! 🎉**

Use any credential pair above to access your portal.
