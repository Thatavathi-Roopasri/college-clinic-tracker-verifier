# Sample Data & Test Cases - Multi-Portal Clinic Tracker

## 📌 Sample Portal Data

### Portal 1: Admin Portal
```json
{
  "name": "Admin Portal",
  "description": "Central administrative portal for system management and oversight",
  "portalType": "admin",
  "sectionIds": ["SEC-001", "SEC-002", "SEC-003"],
  "userIds": ["admin1", "admin2", "superadmin"],
  "active": true
}
```

### Portal 2: Student Portal
```json
{
  "name": "Student Portal",
  "description": "Self-service portal for students to view assignments and communications",
  "portalType": "student",
  "sectionIds": ["SEC-001", "SEC-002"],
  "userIds": ["student1", "student2", "student3", "student4"],
  "active": true
}
```

### Portal 3: Faculty Portal
```json
{
  "name": "Faculty Portal",
  "description": "Portal for faculty members to manage student records",
  "portalType": "faculty",
  "sectionIds": ["SEC-001", "SEC-002", "SEC-003"],
  "userIds": ["faculty1", "faculty2"],
  "active": true
}
```

### Portal 4: Clinic Portal
```json
{
  "name": "Clinic Portal",
  "description": "Clinic staff portal for managing patient visits and health records",
  "portalType": "clinic",
  "sectionIds": ["SEC-001", "SEC-002", "SEC-003"],
  "userIds": ["clinic_staff1", "clinic_staff2", "doctor1"],
  "active": true
}
```

### Portal 5: HOD Portal
```json
{
  "name": "HOD Portal",
  "description": "Head of Department portal for approvals and monitoring",
  "portalType": "hod",
  "sectionIds": ["SEC-001", "SEC-002"],
  "userIds": ["hod1"],
  "active": true
}
```

---

## 🎫 Sample Gate Pass Data

### Active Pass
```json
{
  "userId": "student1",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "passNumber": "GP-2025-OCT-001",
  "status": "active",
  "issuedAt": "2025-10-01T09:00:00",
  "expiresAt": "2025-10-31T18:00:00",
  "usedAt": null,
  "issuerUserId": "admin1",
  "remarks": "Monthly gate pass for October 2025"
}
```

### Used Pass
```json
{
  "userId": "student2",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "passNumber": "GP-2025-OCT-002",
  "status": "used",
  "issuedAt": "2025-10-15T09:00:00",
  "expiresAt": "2025-10-31T18:00:00",
  "usedAt": "2025-10-20T14:30:00",
  "issuerUserId": "faculty1",
  "remarks": "Used for campus event entry"
}
```

### Revoked Pass
```json
{
  "userId": "student3",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "passNumber": "GP-2025-OCT-003",
  "status": "revoked",
  "issuedAt": "2025-10-10T09:00:00",
  "expiresAt": "2025-10-25T18:00:00",
  "usedAt": null,
  "issuerUserId": "admin1",
  "remarks": "Revoked due to disciplinary action"
}
```

### Expired Pass
```json
{
  "userId": "student4",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-002",
  "passNumber": "GP-2025-SEP-001",
  "status": "expired",
  "issuedAt": "2025-09-01T09:00:00",
  "expiresAt": "2025-09-30T18:00:00",
  "usedAt": null,
  "issuerUserId": "admin1",
  "remarks": "September pass - now expired"
}
```

---

## 📄 Sample Letter Data

### Draft Letter (Not Yet Issued)
```json
{
  "userId": "student1",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "letterNumber": "LTR-2025-10-001",
  "letterType": "sick-leave",
  "title": "Medical Certificate - Sick Leave Request",
  "content": "This is to certify that student1 was under medical treatment from October 25-27, 2025 due to fever and flu-like symptoms.",
  "status": "draft",
  "issuedAt": "2025-10-28T10:00:00",
  "expiresAt": "2025-12-28T18:00:00",
  "acknowledgedAt": null,
  "issuerUserId": null,
  "approverUserId": null,
  "attachmentUrl": "/uploads/medical-cert-001.pdf",
  "remarks": null
}
```

### Issued Letter (Sent to Student)
```json
{
  "userId": "student2",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "letterNumber": "LTR-2025-10-002",
  "letterType": "permission",
  "title": "Permission Letter - Research Conference",
  "content": "This letter grants permission to student2 to attend the National Research Conference in Mumbai from November 15-17, 2025. The student is authorized to travel and participate in the conference.",
  "status": "issued",
  "issuedAt": "2025-10-20T14:00:00",
  "expiresAt": "2025-11-17T18:00:00",
  "acknowledgedAt": null,
  "issuerUserId": "faculty1",
  "approverUserId": "hod1",
  "attachmentUrl": "/uploads/permission-letter-002.pdf",
  "remarks": "Approved by HOD - conference credentials attached"
}
```

### Acknowledged Letter (Student Confirmed Receipt)
```json
{
  "userId": "student3",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-002",
  "letterNumber": "LTR-2025-10-003",
  "letterType": "notice",
  "title": "Notice - Attendance Policy Reminder",
  "content": "Dear Student, this is a reminder that the attendance policy requires students to maintain a minimum of 75% attendance. Your current attendance is below the required threshold. Please improve your attendance immediately.",
  "status": "acknowledged",
  "issuedAt": "2025-10-15T09:30:00",
  "expiresAt": "2025-11-15T18:00:00",
  "acknowledgedAt": "2025-10-18T16:45:00",
  "issuerUserId": "faculty1",
  "approverUserId": null,
  "attachmentUrl": null,
  "remarks": "Student acknowledged on Oct 18"
}
```

### Expired Letter
```json
{
  "userId": "student4",
  "portalId": "PORTAL-student-001",
  "sectionId": "SEC-001",
  "letterNumber": "LTR-2025-09-001",
  "letterType": "complaint",
  "title": "Complaint Resolution Letter",
  "content": "Thank you for filing your complaint. The matter has been reviewed and resolved as per college policy.",
  "status": "expired",
  "issuedAt": "2025-09-01T10:00:00",
  "expiresAt": "2025-09-30T18:00:00",
  "acknowledgedAt": "2025-09-05T12:00:00",
  "issuerUserId": "admin1",
  "approverUserId": "hod1",
  "attachmentUrl": "/uploads/complaint-resolution.pdf",
  "remarks": "September letter - now expired"
}
```

---

## 🧪 Test Cases & API Calls

### Test Case 1: Create Portal
```bash
curl -X POST http://localhost:8080/api/portals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Portal",
    "description": "Testing portal creation",
    "portalType": "student"
  }'
```
**Expected Response:** 201 Created with portal ID

---

### Test Case 2: Get All Portals
```bash
curl -X GET http://localhost:8080/api/portals
```
**Expected Response:** 200 OK with list of all portals

---

### Test Case 3: Add Section to Portal
```bash
curl -X POST http://localhost:8080/api/portals/PORTAL-ID/sections/SEC-001
```
**Expected Response:** 200 OK with updated portal containing section

---

### Test Case 4: Create Gate Pass
```bash
curl -X POST http://localhost:8080/api/gatepasses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student1",
    "portalId": "PORTAL-ID",
    "sectionId": "SEC-001",
    "passNumber": "GP-2025-11-001",
    "expiresAt": "2025-11-30T18:00:00",
    "issuerUserId": "admin1"
  }'
```
**Expected Response:** 201 Created with gate pass ID

---

### Test Case 5: Get User's Active Gate Passes
```bash
curl -X GET http://localhost:8080/api/gatepasses/user/student1
```
**Expected Response:** 200 OK with list of passes for student1

---

### Test Case 6: Mark Gate Pass as Used
```bash
curl -X PATCH http://localhost:8080/api/gatepasses/PASS-ID/use
```
**Expected Response:** 200 OK with updated status "used"

---

### Test Case 7: Create Letter (Draft)
```bash
curl -X POST http://localhost:8080/api/letters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student1",
    "portalId": "PORTAL-ID",
    "sectionId": "SEC-001",
    "letterNumber": "LTR-2025-11-001",
    "letterType": "sick-leave",
    "title": "Sick Leave Certificate",
    "content": "This is to certify..."
  }'
```
**Expected Response:** 201 Created with letter ID and status "draft"

---

### Test Case 8: Issue Letter
```bash
curl -X PATCH "http://localhost:8080/api/letters/LETTER-ID/issue?issuerUserId=faculty1"
```
**Expected Response:** 200 OK with status changed to "issued"

---

### Test Case 9: Acknowledge Letter
```bash
curl -X PATCH http://localhost:8080/api/letters/LETTER-ID/acknowledge
```
**Expected Response:** 200 OK with status "acknowledged"

---

### Test Case 10: Get Letters by Type
```bash
curl -X GET http://localhost:8080/api/letters/type/sick-leave
```
**Expected Response:** 200 OK with all sick-leave letters

---

### Test Case 11: Get Expired Passes
```bash
curl -X GET http://localhost:8080/api/gatepasses/expired/list
```
**Expected Response:** 200 OK with all expired gate passes

---

### Test Case 12: Auto-Expire Old Items
```bash
curl -X POST http://localhost:8080/api/gatepasses/maintenance/expire-old
```
**Expected Response:** 200 OK with message "Expired old gate passes"

---

## 📊 Bulk Test Scenario

### Scenario: Complete Student Journey

```bash
# 1. Student logs in (using existing auth)
POST /api/auth/login
{
  "email": "student1@klh.edu.in",
  "password": "password"
}
# Returns: User ID = "student123"

# 2. View available portals
GET /api/portals/user/student123
# Returns: List of portals student has access to

# 3. Get gate passes in portal
GET /api/gatepasses/user/student123/portal/portal456
# Returns: List of active and expired passes

# 4. Get letters in portal
GET /api/letters/user/student123/portal/portal456
# Returns: List of letters (draft, issued, acknowledged, expired)

# 5. Acknowledge a letter
PATCH /api/letters/letter789/acknowledge
# Returns: Letter with status changed to acknowledged

# 6. View current active passes
GET /api/gatepasses/active
# Returns: All non-expired passes
```

---

## 🔍 Verification Checks

### Verify Portal Creation
```bash
GET /api/portals/PORTAL-ID
# Verify all fields are present and correct
```

### Verify Gate Pass Status Transitions
```bash
# Create pass (status: active)
# Mark as used (status: used)
# Try to update used pass (should work)
# Auto-expire check (status: expired)
```

### Verify Letter Workflow
```bash
# Create letter (status: draft)
# Issue letter (status: issued)
# Acknowledge letter (status: acknowledged)
# Try to issue acknowledged letter (should prevent)
```

### Verify Filtering
```bash
# Filter by portal ID
# Filter by user ID
# Filter by section ID
# Filter by status
# Filter by type (for letters)
# Combine filters
```

---

## 📈 Performance Test Data

### Sample Large Dataset Creation
```bash
# Create 5 portals
# Create 10 sections per portal
# Create 100 users across all portals
# Create 500 gate passes
# Create 1000 letters
# Run maintenance tasks
# Check query performance
```

---

## ✅ Test Checklist

- [ ] Portal CRUD operations
- [ ] Gate Pass CRUD operations
- [ ] Letter CRUD operations
- [ ] Status transitions work correctly
- [ ] Filtering by all parameters
- [ ] User access control (user sees only their data)
- [ ] Expiration logic works
- [ ] Maintenance tasks run successfully
- [ ] MongoDB indexes optimize queries
- [ ] Error handling returns correct HTTP codes
- [ ] CORS allows requests from frontend
- [ ] Timestamps are correct
- [ ] Unique constraints are enforced
- [ ] Null fields are handled gracefully

---

## 🐛 Troubleshooting Common Issues

### Issue: 404 Portal Not Found
**Cause:** Portal ID is incorrect or doesn't exist
**Solution:** Verify portal exists with GET /api/portals

### Issue: Invalid Status Transition
**Cause:** Trying to transition from invalid state
**Solution:** Check current status before attempting transition

### Issue: Duplicate Pass Number
**Cause:** Pass number already exists
**Solution:** Use unique pass numbers or check uniqueness constraint

### Issue: MongoDB Connection Failed
**Cause:** MongoDB URI is incorrect
**Solution:** Verify MONGO_URI environment variable

### Issue: Null Pointer Exception
**Cause:** Required field is missing
**Solution:** Check request payload has all required fields

---

**Test Data Ready! Use these samples to validate your API implementation.**
