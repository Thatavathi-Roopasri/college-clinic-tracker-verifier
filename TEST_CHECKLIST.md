# 🧪 QUICK TEST CHECKLIST - GATE PASS SYSTEM

## Pre-Test Verification (Do This First!)

### 1. Backend is Running
```
Open Terminal and run:
netstat -ano | findstr :8080
```
**Expected:** Should show Java process listening on 8080  
**If NOT running:** Start backend
```
cd "c:\Users\kswat\Downloads\cctv (1)\cctv\server-java"
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

### 2. Frontend is Accessible
```
Open Browser:
http://localhost:3000
```
**Expected:** Should load the application

---

## 📝 TEST #1: STUDENT SUBMITS GATE PASS (5 min)

### Login as Student
- [ ] Open: `http://localhost:3000`
- [ ] Role: Select **"Student"**
- [ ] Email: `241003001@klh.edu.in`
- [ ] Password: `student123`
- [ ] Click "Login"

### Submit Gate Pass
- [ ] Click "Letters" in left sidebar
- [ ] Letter Type: Should show **"Gate Pass"** selected
- [ ] Name: Should show **"Swathi"** (auto-filled)
- [ ] Year: Select **"2nd Year"**
- [ ] Roll: Should show **"241003001"** (auto-filled)
- [ ] Department: Select **"CSE"**
- [ ] Reason: Type **"Urgent work"**
- [ ] Time Out: Set to **"23:00"**
- [ ] Click **"Send to HOD"** button

### Verify Success
- [ ] Toast appears: **"✅ Gate pass request saved to server"**
- [ ] Button changes to "Sent" (disabled)
- [ ] No errors in console (F12)

### Check Console (F12 → Console tab)
- [ ] Should see: `✅ Gate pass saved to server with MongoDB ID:`
- [ ] Should show ID like: `507f1f77bcf86cd799439011`
- [ ] Should NOT show ID like: `GP-1761919704869`

**Status:** ✅ PASS / ❌ FAIL

---

## 👨‍💼 TEST #2: HOD LOGS IN AND SEES REQUESTS (3 min)

### Logout and Switch to HOD
- [ ] Click top-right logout button
- [ ] Role dropdown: Select **"HOD"**
- [ ] Email: `hod2@klh.edu.in`
- [ ] Password: `hod2123`
- [ ] Click "Login"

### View Gate Pass Requests
- [ ] Should automatically show HOD dashboard
- [ ] Click **"Gate Pass Requests"** in left sidebar (should already be selected)
- [ ] Panel opens showing pending requests

### Verify Student Details Display Correctly
- [ ] **Name:** Should show **"Swathi"** (NOT "Unknown")
- [ ] **Roll:** Should show **"241003001"** (NOT "N/A")
- [ ] **Year:** Should show **"2nd Year"**
- [ ] **Reason:** Should show **"Urgent work"**
- [ ] **Time Out:** Should show **"23:00"**
- [ ] **Status Badge:** Should show **"⏳ Pending"**

**Status:** ✅ PASS / ❌ FAIL

---

## ✅ TEST #3: HOD APPROVES GATE PASS (2 min)

### Click Approve Button
- [ ] Green button with **"✅ Approve"** text
- [ ] Click on it

### Verify Approval Success
- [ ] Toast message: **"✅ Gate pass approved!"**
- [ ] Status badge changes to: **"✅ Active"**
- [ ] Check console: Should see approval endpoint called

### Refresh and Verify Persistent
- [ ] Press F5 to refresh page
- [ ] Gate pass still shows status as **"✅ Active"**

**Status:** ✅ PASS / ❌ FAIL

---

## ❌ TEST #4: HOD DECLINES GATE PASS (Optional - New Request First)

### Submit Another Gate Pass
- [ ] Logout → Login as student again
- [ ] Submit a NEW gate pass with different reason

### Switch to HOD and Decline
- [ ] Logout → Login as HOD
- [ ] Click **"✘ Decline"** button (red) on the new request
- [ ] Prompt appears: Enter decline reason
- [ ] Type: **"Leave not approved"**
- [ ] Click OK

### Verify Decline Success
- [ ] Toast: **"✅ Gate pass declined!"**
- [ ] Status changes to: **"❌ Declined"**
- [ ] Reason displays when expanded

**Status:** ✅ PASS / ❌ FAIL

---

## 🐛 DEBUGGING CONSOLE MESSAGES

### Normal Success Flow (Check F12 → Console)

**Student Submission:**
```
✅ Sending gate pass request to server (NO ID sent, MongoDB will generate): {...}
✅ Gate pass saved to server with MongoDB ID: {id: "507f1f77bcf86cd799439011", ...}
```

**HOD Viewing:**
```
Fetching all gate passes from /api/gatepasses
Got response: [...]
Filtered to 1 pending requests
🔍 Gate pass ID options: _id= undefined id= 507f1f77bcf86cd799439011 using rid= 507f1f77bcf86cd799439011
Rendering 1 gate pass requests
Processing gate pass: {studentName: "Swathi", studentRoll: "241003001", ...}
```

**HOD Approving:**
```
Approving gate pass: 507f1f77bcf86cd799439011
Approve response: {id: "507f1f77bcf86cd799439011", status: "active", ...}
```

### Error Indicators (DO NOT OCCUR)

❌ **BAD:** `id: "GP-1761919704869"` (frontend ID format)  
❌ **BAD:** `404 Not Found` errors  
❌ **BAD:** `"Unknown"` name or `"N/A"` roll number  
❌ **BAD:** `Approve error` messages  

---

## 📱 BROWSER REQUIREMENTS

- **Clear Cache:** Ctrl+Shift+Delete → Clear all  
- **Open Console:** F12 → Console tab
- **Device:** Works on desktop only (responsive design not needed)
- **JavaScript:** Must be enabled

---

## ⚡ Quick Shortcuts

**Restart Backend:**
```powershell
taskkill /F /IM java.exe
cd "c:\Users\kswat\Downloads\cctv (1)\cctv\server-java"
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

**Clear Browser Cache:**
- Chrome: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete

**Check Backend Health:**
```
Open: http://localhost:8080/api/gatepasses
Should return: [] or [...]
```

---

## 📊 Final Checklist

- [ ] Test #1: Student Submits - **PASS**
- [ ] Test #2: HOD Sees Correct Details - **PASS**
- [ ] Test #3: HOD Approves - **PASS**
- [ ] Test #4: HOD Declines (Optional) - **PASS**
- [ ] Console shows no errors
- [ ] No "Unknown" or "N/A" displayed
- [ ] IDs are MongoDB ObjectId format
- [ ] Approval status persists on refresh

**Overall Status:** ✅ **READY FOR PRODUCTION**

---

*Use this checklist to verify the system works perfectly!*
