# Quick Reference Guide - Multi-Portal Clinic Tracker

## 🎯 Portal Types Supported

| Portal Type | Purpose | Users | Access |
|------------|---------|-------|--------|
| **admin** | System administration | Admins | All sections, all users |
| **student** | Student access | Students | Own section only |
| **faculty** | Faculty/Staff access | Faculty | Assigned sections |
| **clinic** | Clinic operations | Clinic staff | All patients/sections |
| **hod** | Head of Department | HOD | Department sections |

---

## 📋 Common API Patterns

### Create Resource
```bash
curl -X POST http://localhost:8080/api/{resource} \
  -H "Content-Type: application/json" \
  -d '{ ...data... }'
```

### Get All Resources
```bash
curl -X GET http://localhost:8080/api/{resource}
```

### Get Specific Resource
```bash
curl -X GET http://localhost:8080/api/{resource}/{id}
```

### Update Resource
```bash
curl -X PUT http://localhost:8080/api/{resource}/{id} \
  -H "Content-Type: application/json" \
  -d '{ ...updated_data... }'
```

### Delete Resource
```bash
curl -X DELETE http://localhost:8080/api/{resource}/{id}
```

### Action (Status Change)
```bash
curl -X PATCH http://localhost:8080/api/{resource}/{id}/{action}
```

---

## 🔐 Portal Access Control Workflow

```
User Logs In
    ↓
Check User Roles (from User model)
    ↓
Query Portals where userIds contains user ID
    ↓
Load Portal Data
    ├── Get Sections for Portal
    ├── Get Gate Passes for User in Portal
    └── Get Letters for User in Portal
```

---

## 📊 Gate Pass Lifecycle

```
Created (active)
    ↓
    ├─→ Used → Final State (mark as used)
    ├─→ Expired → Final State (auto or manual)
    ├─→ Revoked → Final State (admin action)
    └─→ Active (until expiration)
```

**API Calls for Gate Pass:**
```bash
# Create
POST /api/gatepasses

# Check Status
GET /api/gatepasses/{id}

# Mark as Used
PATCH /api/gatepasses/{id}/use

# Revoke
PATCH /api/gatepasses/{id}/revoke?remarks=reason

# Get Active Passes
GET /api/gatepasses/active
```

---

## 📝 Letter Lifecycle

```
Draft (not yet issued)
    ↓
Issued (sent to recipient)
    ↓
Acknowledged (recipient confirmed)
    ↓
Expired (auto-expiration) [Optional]
```

**API Calls for Letter:**
```bash
# Create (starts as draft)
POST /api/letters

# Issue (admin/faculty action)
PATCH /api/letters/{id}/issue?issuerUserId=admin123

# Acknowledge (recipient action)
PATCH /api/letters/{id}/acknowledge

# Approve (optional HOD approval)
PATCH /api/letters/{id}/approve?approverUserId=hod456

# Check Status
GET /api/letters/{id}
```

---

## 🔍 Common Queries

### Get User's Portals
```bash
GET /api/portals/user/{userId}
```
Returns all portals the user has access to.

### Get User's Gate Passes in Portal
```bash
GET /api/gatepasses/user/{userId}/portal/{portalId}
```
Returns all gate passes issued to user in specific portal.

### Get User's Letters in Portal
```bash
GET /api/letters/user/{userId}/portal/{portalId}
```
Returns all letters issued to user in specific portal.

### Get Active Gate Passes
```bash
GET /api/gatepasses/active
```
Returns all non-expired gate passes.

### Get Expired Letters
```bash
GET /api/letters/expired/list
```
Returns all letters past expiration date.

### Get Letters by Type
```bash
GET /api/letters/type/{letterType}
```
Returns letters filtered by type (sick-leave, permission, etc.).

---

## 💾 MongoDB Index Recommendations

Add these indexes to optimize queries:

```javascript
// Portals Collection
db.portals.createIndex({ "name": 1 }, { unique: true })
db.portals.createIndex({ "portalType": 1 })
db.portals.createIndex({ "active": 1 })
db.portals.createIndex({ "sectionIds": 1 })
db.portals.createIndex({ "userIds": 1 })

// Gate Passes Collection
db.gatepasses.createIndex({ "passNumber": 1 }, { unique: true })
db.gatepasses.createIndex({ "userId": 1 })
db.gatepasses.createIndex({ "portalId": 1 })
db.gatepasses.createIndex({ "status": 1 })
db.gatepasses.createIndex({ "expiresAt": 1 })
db.gatepasses.createIndex({ "userId": 1, "portalId": 1 })

// Letters Collection
db.letters.createIndex({ "letterNumber": 1 }, { unique: true })
db.letters.createIndex({ "userId": 1 })
db.letters.createIndex({ "portalId": 1 })
db.letters.createIndex({ "status": 1 })
db.letters.createIndex({ "letterType": 1 })
db.letters.createIndex({ "expiresAt": 1 })
db.letters.createIndex({ "userId": 1, "portalId": 1 })
```

---

## 🔄 Sample Workflow

### Scenario: Issuing a Sick Leave Letter to Student

**Step 1: Student logs in**
```bash
# Login (using existing AuthController)
POST /api/auth/login
```

**Step 2: Get Student's Portals**
```bash
GET /api/portals/user/student123
# Response: Student can access "Student Portal"
```

**Step 3: Create Letter Draft**
```bash
POST /api/letters
{
  "userId": "student123",
  "portalId": "portal456",
  "sectionId": "sectionA",
  "letterNumber": "SL-2025-001",
  "letterType": "sick-leave",
  "title": "Sick Leave Certificate",
  "content": "This is to certify that student was unwell for 3 days.",
  "status": "draft"
}
```

**Step 4: Faculty/Admin Issues Letter**
```bash
PATCH /api/letters/letter789/issue?issuerUserId=faculty456
# Status changes: draft → issued
```

**Step 5: Student Acknowledges**
```bash
PATCH /api/letters/letter789/acknowledge
# Status changes: issued → acknowledged
```

**Step 6: Admin Approves (optional)**
```bash
PATCH /api/letters/letter789/approve?approverUserId=admin111
# Approver info is recorded
```

**Step 7: Retrieve Letter**
```bash
GET /api/letters/user/student123/portal/portal456
# Returns all letters for student in that portal
```

---

## 🛠️ Maintenance Tasks

### Auto-Expire Old Gate Passes
```bash
POST /api/gatepasses/maintenance/expire-old
```
Run periodically (daily/weekly) to mark expired passes.

### Auto-Expire Old Letters
```bash
POST /api/letters/maintenance/expire-old
```
Run periodically to mark expired letters.

### Check Expired Items
```bash
# Get expired gate passes
GET /api/gatepasses/expired/list

# Get expired letters
GET /api/letters/expired/list
```

---

## 📱 Frontend Integration Points

### For Student Portal
```javascript
// 1. Get user's portals
GET /api/portals/user/{userId}

// 2. Get gate passes for student
GET /api/gatepasses/user/{userId}/portal/{portalId}

// 3. Get letters for student
GET /api/letters/user/{userId}/portal/{portalId}

// 4. Acknowledge a letter
PATCH /api/letters/{letterId}/acknowledge
```

### For Faculty Portal
```javascript
// 1. Get faculty's portals
GET /api/portals/user/{userId}

// 2. Create gate pass for student
POST /api/gatepasses

// 3. Create letter for student
POST /api/letters

// 4. Issue letter
PATCH /api/letters/{letterId}/issue?issuerUserId={facultyId}

// 5. Get letters issued by faculty
GET /api/letters/issued-by/{facultyId}
```

### For Admin Portal
```javascript
// 1. Get all portals
GET /api/portals

// 2. Manage portal access
POST /api/portals/{portalId}/users/{userId}
DELETE /api/portals/{portalId}/users/{userId}

// 3. Monitor all gate passes
GET /api/gatepasses

// 4. Monitor all letters
GET /api/letters

// 5. Perform maintenance
POST /api/gatepasses/maintenance/expire-old
POST /api/letters/maintenance/expire-old
```

---

## 🚨 Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Resource retrieved |
| 201 | Created | New resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid data format |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | No access permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal error |

### Example Error Response
```json
{
  "error": "Portal not found",
  "status": 404,
  "timestamp": "2025-10-30T10:30:00"
}
```

---

## 🎨 Example Portal Setup

### Admin Portal Setup
```bash
# Create Admin Portal
POST /api/portals
{
  "name": "Admin Portal",
  "description": "Administrative portal for system management",
  "portalType": "admin"
}

# Add all sections
POST /api/portals/portal1/sections/sectionA
POST /api/portals/portal1/sections/sectionB
POST /api/portals/portal1/sections/sectionC

# Add admin users
POST /api/portals/portal1/users/admin1
POST /api/portals/portal1/users/admin2
```

### Student Portal Setup
```bash
# Create Student Portal
POST /api/portals
{
  "name": "Student Portal",
  "description": "Portal for student access",
  "portalType": "student"
}

# Add student sections only
POST /api/portals/portal2/sections/sectionA

# Add student users
POST /api/portals/portal2/users/student1
POST /api/portals/portal2/users/student2
```

---

## 📞 Support References

- **MongoDB Documentation**: https://docs.mongodb.com/
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **RESTful API Best Practices**: https://restfulapi.net/
- **Java Spring Data MongoDB**: https://spring.io/projects/spring-data-mongodb

---

**Last Updated: 2025-10-30**
