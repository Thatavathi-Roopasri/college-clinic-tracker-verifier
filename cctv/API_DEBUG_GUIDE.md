# 🔧 MANUAL API TESTING & DEBUG GUIDE

This guide helps you manually test API endpoints and check database state using PowerShell and curl.

---

## 1️⃣ GET ALL GATE PASSES

```powershell
curl -X GET http://localhost:8080/api/gatepasses `
  -H "Content-Type: application/json" | ConvertFrom-Json | ConvertTo-Json
```

**Expected Output:** List of all gate passes with IDs

---

## 2️⃣ GET PENDING GATE PASSES (Status = pending_approval)

```powershell
curl -X GET "http://localhost:8080/api/gatepasses" | ConvertFrom-Json | 
  Where-Object { $_.status -eq "pending_approval" } | ConvertTo-Json
```

**Expected Output:** Only gate passes awaiting HOD approval

---

## 3️⃣ SEND GATE PASS (Student)

Replace values as needed:

```powershell
$body = @{
    studentName = "John Student"
    studentRoll = "2101"
    studentYear = "2nd Year"
    department = "Computer Science"
    studentEmail = "student@example.com"
    reason = "Medical Appointment"
    timeOut = "14:00"
    status = "pending_approval"
    userId = "student123"
    hodSectionId = "section456"
} | ConvertTo-Json

curl -X POST http://localhost:8080/api/gatepasses `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Output:** 
```json
{
  "_id": "ObjectId(...)",
  "studentName": "John Student",
  "status": "pending_approval"
}
```

---

## 4️⃣ APPROVE GATE PASS (HOD)

**Get ID from Step 2 output, then:**

```powershell
# Replace {ID} with actual ID from database
$id = "6904f15dbb0c54a61ed46fbc"

curl -X PATCH "http://localhost:8080/api/gatepasses/$id/approve" `
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "_id": "6904f15dbb0c54a61ed46fbc",
  "status": "approved",
  "approvedAt": "2025-10-31T23:10:00..."
}
```

**If 404 Error:**
1. Verify ID is correct from Step 2
2. Check MongoDB: `db.gatepasses.find({_id: ObjectId("...")})`
3. If not found, gate pass not actually saved to database

---

## 5️⃣ DECLINE GATE PASS (HOD)

```powershell
$id = "6904f15dbb0c54a61ed46fbc"

$body = @{
    declineReason = "Invalid documentation"
} | ConvertTo-Json

curl -X PATCH "http://localhost:8080/api/gatepasses/$id/decline" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Output:**
```json
{
  "_id": "6904f15dbb0c54a61ed46fbc",
  "status": "declined",
  "declineReason": "Invalid documentation"
}
```

---

## 6️⃣ GET STUDENT'S GATE PASSES

```powershell
$userId = "student123"

curl -X GET "http://localhost:8080/api/gatepasses/user/$userId" `
  -H "Content-Type: application/json"
```

**Expected Output:** All gate passes for that student (including pending, approved, declined)

---

## 🗄️ MONGODB QUERIES

**Check MongoDB collections:**

```bash
# Connect to MongoDB Atlas and run these commands:

# Count all gate passes
db.gatepasses.countDocuments({})

# Find all pending gate passes
db.gatepasses.find({ status: "pending_approval" })

# Find all approved gate passes
db.gatepasses.find({ status: "approved" })

# Find specific gate pass by ID
db.gatepasses.findOne({ _id: ObjectId("6904f15dbb0c54a61ed46fbc") })

# Show structure of gate pass document
db.gatepasses.findOne({})

# Delete test data (if needed)
db.gatepasses.deleteMany({ studentYear: "test" })
```

---

## 🐛 DEBUGGING WORKFLOW

### **If Send to HOD fails:**
1. Check browser console for error message
2. Verify all fields filled (Year, Reason, TimeOut)
3. Check API response: Should be 201 (Created)
4. Verify in MongoDB: `db.gatepasses.find()` - should list new entry

### **If HOD Approval fails (404):**
1. Get gate pass ID from browser console: `console.log(gatePassId)`
2. Run: `db.gatepasses.findOne({_id: ObjectId("ID_HERE")})`
3. If returns null → Gate pass not saved to database
4. If returns document → Check backend logs for error

### **If Year/Reason/TimeOut show as "—":**
1. Check sent data: `console.log('Sending:', reqToSend)`
2. Verify all fields have values (not empty strings or null)
3. Check MongoDB document: `db.gatepasses.findOne({})`
4. See if fields are stored (they should be)

---

## ✅ SUCCESS INDICATORS

✅ **Send to HOD works if:**
- API returns 201 status
- Gate pass ID appears in console
- `db.gatepasses.countDocuments({})` increases by 1
- Document has `status: "pending_approval"`

✅ **Approve works if:**
- API returns 200 status
- No 404 error
- Gate pass disappears from HOD list
- `db.gatepasses.findOne({_id: ...}).status` = "approved"

✅ **Student sees it if:**
- Student re-logs in
- Gate pass appears in history with status: "approved"
- Download button is enabled

---

## 🔗 ENDPOINT REFERENCE

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/gatepasses` | Get all gate passes |
| GET | `/api/gatepasses/user/{userId}` | Get user's gate passes |
| POST | `/api/gatepasses` | Create new gate pass |
| PATCH | `/api/gatepasses/{id}/approve` | Approve gate pass |
| PATCH | `/api/gatepasses/{id}/decline` | Decline gate pass |

---

## 📝 QUICK TEST SEQUENCE

```powershell
# 1. Get all gate passes
curl -X GET http://localhost:8080/api/gatepasses

# 2. Create new one
$body = @{studentName="Test";studentRoll="9999";studentYear="Test";reason="Test";timeOut="15:00";status="pending_approval"} | ConvertTo-Json
$resp = curl -X POST http://localhost:8080/api/gatepasses -H "Content-Type: application/json" -d $body
$id = $resp._id

# 3. Try to approve
curl -X PATCH "http://localhost:8080/api/gatepasses/$id/approve"

# 4. Check status
curl -X GET http://localhost:8080/api/gatepasses
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| 404 on approve | Verify gate pass ID exists: `db.gatepasses.findOne({_id: ObjectId(...)})` |
| Fields showing as "—" | Check if sent in POST body and verify DB has them |
| Gate pass appears twice | Clear localStorage: `localStorage.clear()` then refresh |
| Server not responding | Check: `netstat -ano \| findstr 8080` - restart if needed |
| MongoDB connection error | Verify MongoDB Atlas credentials in `application.properties` |

