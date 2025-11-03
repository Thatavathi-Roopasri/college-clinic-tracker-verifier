# 🚀 Quick Start - Run Your Application Now

## One-Command Startup

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"; $env:Path = "$env:JAVA_HOME\bin;C:\apache-maven\apache-maven-3.9.11\bin;$env:Path"; $env:MONGO_URI = "mongodb+srv://Project01:Welcome12345@project01.bmejhvq.mongodb.net/clinicdb?retryWrites=true&w=majority"; cd "c:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java"; java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

## What Happens When You Start

1. **Database Seeding** (if first run):
   ```
   ✅ 15 users created successfully!
   ✅ 5 portals created successfully!
   ```

2. **Application Startup**:
   ```
   Started ClinicServerApplication in X.XXX seconds
   Tomcat started on port(s): 8080
   ```

3. **You'll See**:
   ```
   Application is ready! Navigate to http://localhost:8080
   ```

---

## Test the API

### 1. Login (Get JWT Token)
```bash
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@clinic.edu.in","password":"admin123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin"
}
```

### 2. Save Token & Use in Next Requests
```bash
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Get All Portals
```bash
curl -X GET http://localhost:8080/api/portals `
  -H "Authorization: Bearer $token"
```

### 4. Create a Gate Pass
```bash
curl -X POST http://localhost:8080/api/gatepasses `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    "userId": "241003001@klh.edu.in",
    "portalId": "student-portal-id",
    "sectionId": "section-id",
    "issuerUserId": "faculty1@klh.edu.in"
  }'
```

---

## Test Credentials (Pre-Seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.edu.in | admin123 |
| Faculty | faculty1@klh.edu.in | faculty123 |
| Student | 241003001@klh.edu.in | 241003001 |
| HOD | hod@clinic.edu.in | hod123 |
| Clinic | clinic_staff@clinic.edu.in | clinic123 |

---

## Useful Links

- **API Documentation:** See `MULTI-PORTAL-API.md`
- **Login Credentials:** See `TEST-LOGIN-CREDENTIALS.md`
- **Test Examples:** See `TEST-DATA-EXAMPLES.md`
- **Full Configuration:** See `CONFIGURATION-GUIDE.md`

---

## Logs Will Show

```
2025-10-30 13:45:00.123  INFO 12345 --- [main] com.example.clinicserver.seed.SeedDatabase  : Seeding Users...
2025-10-30 13:45:01.456  INFO 12345 --- [main] com.example.clinicserver.seed.SeedDatabase  : ✅ 15 users created successfully!
2025-10-30 13:45:02.789  INFO 12345 --- [main] com.example.clinicserver.seed.SeedDatabase  : Seeding Portals...
2025-10-30 13:45:03.012  INFO 12345 --- [main] com.example.clinicserver.seed.SeedDatabase  : ✅ 5 portals created successfully!
2025-10-30 13:45:05.234  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer    : Tomcat started on port(s): 8080
2025-10-30 13:45:05.456  INFO 12345 --- [main] c.e.c.ClinicServerApplication               : Started ClinicServerApplication in 5.234 seconds
```

---

## Stop the Application

Press `Ctrl + C` in the terminal to stop the server gracefully.

---

## JAR File Details

| Property | Value |
|----------|-------|
| Location | `target/clinic-server-0.0.1-SNAPSHOT.jar` |
| Size | 28.16 MB |
| Format | Spring Boot Executable JAR |
| Java Version | 21+ (built with JDK 24) |
| Embedded Server | Tomcat 10.1.x |
| Database | MongoDB (Atlas) |

---

**Everything is ready! Run the command above to start your application.** 🎉
