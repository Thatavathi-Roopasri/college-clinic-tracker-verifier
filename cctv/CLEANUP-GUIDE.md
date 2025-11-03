# 🗑️ CLEANUP GUIDE: Remove Unwanted Data

## Overview
This guide helps you clean up old/unwanted data from MongoDB while keeping the system ready for fresh testing.

---

## 🎯 What Gets Cleaned

### **Option 1: Clean All Gate Passes** (Recommended)
```
Remove: ALL gate passes from database
Keep: Users, sections, and other data
Result: Fresh database for new testing
```

### **Option 2: Clean Specific Gate Pass**
```
Remove: Single gate pass by ID
Keep: Everything else
Result: Remove problematic data only
```

### **Option 3: Full Database Reset**
```
Remove: EVERYTHING (users, sections, gate passes, etc.)
Keep: Nothing
Result: Completely clean slate
⚠️ WARNING: You'll need to seed users again
```

---

## 🚀 Quick Cleanup Steps

### **Step 1: Server Must Be Running**
```
Server should be running on port 8080
If not, run: java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

### **Step 2: Execute Cleanup Command**

#### **Clean Gate Passes Only** (Recommended ✅)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/cleanup/all" `
  -Method Delete `
  -ErrorAction Stop

$response.Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "message": "Deleted X gate passes"
}
```

---

#### **View All Gate Passes Before Cleanup**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses" `
  -Method Get `
  -Headers @{"Content-Type" = "application/json"} `
  -ErrorAction Stop

$gatepasses = $response.Content | ConvertFrom-Json
Write-Host "Total gate passes: $($gatepasses.Count)"
$gatepasses | ForEach-Object { Write-Host "- $_" }
```

---

#### **Delete Specific Gate Pass by ID**
```powershell
$gatePassId = "6904f15dbb0c54a61ed46fbc"  # Replace with actual ID

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/$gatePassId" `
  -Method Delete `
  -ErrorAction Stop

Write-Host "✅ Gate pass deleted: $gatePassId"
```

---

## 🔧 MongoDB Atlas Manual Cleanup

If API endpoints don't work, you can clean up directly in MongoDB:

### **Step 1: Access MongoDB Atlas**
1. Go to: https://cloud.mongodb.com
2. Login with your credentials
3. Select your Project01 cluster
4. Click "Collections" tab

### **Step 2: Select gatepasses Collection**
1. Under `clinicdb` database
2. Click `gatepasses` collection
3. You'll see all documents

### **Step 3: Delete Documents**

#### **Delete All Gate Passes**
```javascript
db.gatepasses.deleteMany({})
```

**Result:** Empty gatepasses collection

#### **Delete Specific Gate Pass**
```javascript
db.gatepasses.deleteOne({
  _id: ObjectId("6904f15dbb0c54a61ed46fbc")
})
```

#### **Delete Gate Passes by Status**
```javascript
// Delete all pending approvals
db.gatepasses.deleteMany({ status: "pending_approval" })

// Delete all approved
db.gatepasses.deleteMany({ status: "approved" })

// Delete all declined
db.gatepasses.deleteMany({ status: "declined" })
```

#### **Delete Gate Passes from Specific Student**
```javascript
db.gatepasses.deleteMany({
  studentEmail: "student1@test.com"
})
```

---

## 📊 Verify Cleanup

### **Check via API**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses" `
  -Method Get `
  -Headers @{"Content-Type" = "application/json"} `
  -ErrorAction Stop

$gatepasses = $response.Content | ConvertFrom-Json
Write-Host "Remaining gate passes: $($gatepasses.Count)"

if ($gatepasses.Count -eq 0) {
  Write-Host "✅ All gate passes deleted successfully!" -ForegroundColor Green
} else {
  Write-Host "⚠️  Still have $($gatepasses.Count) gate passes" -ForegroundColor Yellow
}
```

### **Check via MongoDB Atlas**
1. Go to Collections → gatepasses
2. Click "Find"
3. Count should be 0 (or show remaining)

---

## ✅ After Cleanup

### **Your System is Now:**
- ✅ Clean and fresh
- ✅ Ready for new testing
- ✅ No old/unwanted data
- ✅ Same users and sections intact
- ✅ Ready to test the gate pass workflow from scratch

### **Next Steps:**
1. Go to student portal: `http://localhost:3000`
2. Create NEW gate pass
3. Send to HOD
4. Test approval (should work now with fresh data)

---

## 🚨 What If I Delete Something Accidentally?

### **Option 1: Restore from Backup**
MongoDB Atlas has backups - contact MongoDB support

### **Option 2: Re-seed Database**
The system auto-seeds users on startup:
```
[SeedDatabase] Starting seeding process...
[SeedDatabase] Current user count: 15
```

If users are deleted, they'll be recreated on next restart.

### **Option 3: Re-create Manually**
Use API to create new data:
```powershell
$newStudent = @{
  name = "Test Student"
  email = "teststudent@test.com"
  password = "password123"
  role = "student"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/users" `
  -Method Post `
  -Body $newStudent `
  -Headers @{"Content-Type" = "application/json"}
```

---

## 📋 Cleanup Command Reference

```powershell
# Clean all gate passes
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/cleanup/all" -Method Delete

# Get all gate passes (before cleanup)
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses" -Method Get

# Delete specific gate pass
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/[ID]" -Method Delete

# Get pending gate passes for HOD
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/hod/[HOD_ID]/pending" -Method Get

# Get gate passes by status
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/status/pending_approval" -Method Get
```

---

## 🎯 Common Cleanup Scenarios

### **Scenario 1: Test Data Cleanup**
```powershell
# Remove all gate passes after testing
Invoke-WebRequest -Uri "http://localhost:8080/api/gatepasses/cleanup/all" -Method Delete
```

### **Scenario 2: Remove Failed Requests**
```javascript
// In MongoDB Atlas console
// Delete gate passes that failed (status="error" or null)
db.gatepasses.deleteMany({ 
  $or: [
    { status: "error" },
    { status: null }
  ]
})
```

### **Scenario 3: Clean Specific Date Range**
```javascript
// Delete gate passes created before Oct 31
db.gatepasses.deleteMany({
  createdAt: { $lt: new Date("2025-10-31") }
})
```

### **Scenario 4: Keep Only Approved**
```javascript
// Delete everything except approved gate passes
db.gatepasses.deleteMany({
  status: { $ne: "approved" }
})
```

---

## 🔒 Safety Tips

### **Before You Delete:**
1. ✅ Backup important data
2. ✅ Note any IDs you need
3. ✅ Verify you're deleting the right data

### **After You Delete:**
1. ✅ Verify deletion was successful
2. ✅ Check database has expected data
3. ✅ Test workflow with new data

---

## 📞 Troubleshooting

### **API Cleanup Not Working**
```
Error: Connection refused to localhost:8080

Fix: 
1. Ensure server is running
2. Check it's on port 8080
3. Verify MongoDB connection
```

### **MongoDB Cleanup Not Working**
```
Error: Command not recognized

Fix:
1. Use MongoDB Atlas web console instead
2. Or use MongoDB CLI tool
3. Or use Compass (MongoDB GUI)
```

### **Partial Deletion**
```
Problem: Some gate passes still exist

Fix:
1. Check deletion query is correct
2. Run cleanup again
3. Verify via MongoDB Atlas console
```

---

**Status:** Ready to cleanup  
**Next:** Run cleanup commands above  
**Result:** Fresh database for testing
