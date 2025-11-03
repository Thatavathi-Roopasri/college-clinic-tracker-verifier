# ✅ MANUAL TESTING CHECKLIST - Fix 404 Error

## 🎯 Goal
Get the gate pass approval to work WITHOUT 404 error.

---

## 📝 Pre-Test Setup

### ✓ Step 1: Restart Everything Fresh
```powershell
# PowerShell - In cctv (1) directory
cd "C:\Users\kswat\Downloads\cctv (1)\cctv\server-java"

# Kill old Java
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait
Start-Sleep -Seconds 3

# Rebuild
mvn clean package -DskipTests=true

# Start fresh
mvn spring-boot:run
```

**Wait for:** `Started ClinicServerApplication in X seconds`

### ✓ Step 2: Open Browser & Clean Cache
- Go to: `http://localhost:3000`
- Press: `Ctrl+Shift+Delete` (Clear cache)
- Or hard refresh: `Ctrl+Shift+R`

### ✓ Step 3: Open DevTools
- Press: `F12`
- Go to: **Console** tab
- **Keep it open during entire test**

---

## 🧪 TEST 1: Student Sends Gate Pass

### ✓ Part A: Login as Student
- [ ] Click "Login"
- [ ] Email: `student1@test.com`
- [ ] Password: `password123`
- [ ] Portal: Select **Student**
- [ ] Click **Login**

**Expected:** ✅ Redirected to student dashboard

### ✓ Part B: Generate Gate Pass

1. [ ] Look for **"Request New Letter/Document"** section
2. [ ] Select **Letter Type:** "Gate Pass"
3. [ ] Fill form:
   - **Student Name:** Your name (or "Test Student")
   - **Year:** 2024
   - **Roll No:** 1001
   - **Department:** CSE
   - **Reason:** "Lab class"
   - **Time Out:** 2025-01-15 @ 14:30
4. [ ] Click **"Preview"** button

**Expected:** ✅ See preview of gate pass

### ✓ Part C: Send to HOD

1. [ ] Click **"Send to HOD"** button
2. [ ] Look at browser **Console** (F12)

**CRITICAL - Check for this message:**
```
✅ Sending gate pass to HOD (NO ID sent, MongoDB will generate): {
  studentEmail: "student1@test.com",
  studentName: "Test Student",
  ...
}
```

**Then look for:**
```
✅ Gate pass received by HOD: {
  _id: "XXXXXXXXXXXXXXXXXXXXXXXX",  ← COPY THIS ID
  studentName: "Test Student",
  status: "pending_approval",
  ...
}
```

**Write down the ID here:**
```
Gate Pass ID Created: _______________________________
```

**Expected:** ✅ You see the `_id` value (24-character hex string)

3. [ ] Look for this line too:
```
✅ Status from server: pending_approval
```

**If you DON'T see these messages:**
- ❌ PROBLEM 1: Gate pass not being created
- Action: Check Java server terminal for errors

---

## 🧪 TEST 2: HOD Reviews & Approves

### ✓ Part A: Logout from Student

1. [ ] Click **"Logout"** button
2. [ ] Or just reload page

### ✓ Part B: Login as HOD

1. [ ] Click **"Login"**
2. [ ] Email: `hod@test.com`
3. [ ] Password: `password123`
4. [ ] Portal: Select **HOD**
5. [ ] Click **Login**

**Expected:** ✅ Redirected to HOD dashboard

### ✓ Part C: View Pending Gate Passes

1. [ ] Look for section: **"Pending Gate Pass Requests"** or similar
2. [ ] You should see the gate pass from student with:
   - Student name: "Test Student"
   - Status: "Pending"
   - Action buttons: [Approve] [Decline]

**If you DON'T see the gate pass:**
- ❌ PROBLEM: Gate pass not appearing in pending list
- Action: It was never saved to MongoDB in Step 1

### ✓ Part D: Click Approve

1. [ ] Click **[Approve]** button for the student's gate pass
2. [ ] **WATCH CONSOLE IMMEDIATELY** (F12)

**CRITICAL - Watch for these messages:**

**✅ SUCCESS Scenario:**
```
📋 Checking if gate pass exists in database...
✅ Gate pass found: {
  _id: "[ID from Step 1]",
  status: "pending_approval",
  ...
}
✅ Gate pass approved successfully
✅ Status from server: approved
✅ Gate pass removed from pending list
```

**❌ FAILURE Scenario:**
```
📋 Checking if gate pass exists in database...
🔍 Verifying gate pass exists before approving...
❌ Gate pass NOT found in database
PATCH /gatepasses/[ID]/approve failed 404
```

**What to check:**
- Compare ID from Step 1 with ID in approve error
- Do they match exactly?
- Record what you see:

```
ID from student send: ____________________________
ID in approve attempt: ____________________________
Match? ✓ / ✗
```

---

## 📊 Results Interpretation

### **Result 1: ✅ Gate Pass Approved Successfully**

**Console shows:**
- ✅ Gate pass found
- ✅ Gate pass approved

**Next steps:**
1. [ ] Confirm gate pass removed from HOD pending list
2. [ ] Check student portal - should see in history
3. [ ] Test download PDF

**Congratulations! 🎉 The workflow is working!**

---

### **Result 2: ❌ Gate Pass NOT Found (404 Error)**

**Console shows:**
- ❌ Gate pass NOT found in database

**Root cause to investigate:**

#### **Check A: Was gate pass actually created?**
```powershell
# At MongoDB Atlas:
# 1. Go to Collections
# 2. Select "gatepasses" collection
# 3. Search: { "studentName": "Test Student" }
# 4. Do you see ANY gate pass from this student?
```

Result:
- [ ] YES → Gate pass exists (Problem is ID format)
- [ ] NO → Gate pass never saved (Problem is POST)

#### **Check B: Are IDs matching?**
```
ID from student console: ____________________________
ID in MongoDB (if exists): ____________________________
ID in approve attempt: ____________________________

All three same? ✓ / ✗
```

---

## 🔧 Troubleshooting by Scenario

### **Scenario 1: Gate Pass Not Created (Most Common)**

**Symptoms:**
- [ ] Student sends gate pass
- [ ] Console shows "✅ Gate pass received" with ID
- [ ] But gate pass NOT in MongoDB

**Why:** POST endpoint returns data but doesn't save

**Fix:**
```java
// In GatePassController.java
@PostMapping
public ResponseEntity<GatePass> createGatePass(@RequestBody GatePass gatePass) {
    System.out.println("📥 Creating gate pass with data: " + gatePass);
    GatePass createdGatePass = gatePassService.createGatePass(gatePass);
    System.out.println("✅ Created with ID: " + createdGatePass.getId());
    return new ResponseEntity<>(createdGatePass, HttpStatus.CREATED);
}
```

Then watch Java logs when student sends.

---

### **Scenario 2: ID Format Mismatch**

**Symptoms:**
- [ ] Gate pass IS in MongoDB
- [ ] But IDs don't match between systems
- [ ] When HOD approves, says NOT found

**Fix:**
Add logging in approveGatePass:
```java
public GatePass approveGatePass(String id) {
    System.out.println("🔍 Approve: Looking for ID=" + id + " (len=" + id.length() + ")");
    Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
    System.out.println("✅ Found: " + optionalGatePass.isPresent());
    ...
}
```

Watch logs when HOD clicks approve.

---

### **Scenario 3: MongoDB Connection Issue**

**Symptoms:**
- [ ] No gate passes appearing at all
- [ ] Errors in Java logs about MongoDB

**Fix:**
Check `application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://[user]:[pass]@cluster.mongodb.net/clinicdb?retryWrites=true&w=majority
```

Is connection string correct?

---

## 📋 Information to Share If Stuck

**Take screenshot/notes of:**

1. **From Student Console:**
   ```
   Gate Pass ID Created: ________________
   Server Status: ________________
   ```

2. **From MongoDB Atlas:**
   ```
   Gate pass found? YES / NO
   If yes, ID in MongoDB: ________________
   ```

3. **From HOD Console:**
   ```
   ID being searched: ________________
   Pre-check result: FOUND / NOT FOUND
   Error message: ________________
   ```

4. **From Java Server Logs:**
   ```
   (Any errors during POST): ________________
   (Any errors during PATCH): ________________
   ```

---

## ✅ Final Verification

Once approve works:

- [ ] Gate pass disappears from HOD pending list
- [ ] Student portal shows gate pass in history
- [ ] Status shows "Approved"
- [ ] Download button available
- [ ] Test decline - should work same way
- [ ] Test complete workflow 2 more times

**If all above work → 🎉 SYSTEM IS FIXED!**

---

## 🆘 If You Get Stuck

1. **Restart server** fresh (clear Java, rebuild, start)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open DevTools** (F12) - keep console visible
4. **Run test** step by step
5. **Copy console output** - paste in next message
6. **Send Java server logs** - what appears when you click approve

**With that info, I can identify exact fix needed.**

---

**Created:** Today  
**Purpose:** Fix HTTP 404 error on gate pass approval  
**Expected Time:** 15-20 minutes to test and identify issue
