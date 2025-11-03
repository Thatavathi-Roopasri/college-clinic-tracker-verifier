# 🎯 GATE PASS WORKFLOW - FINAL TESTING

## ✅ Server Status
- ✅ Backend running on port 8080
- ✅ MongoDB Atlas connected (Replica Set)
- ✅ Application loaded at http://localhost:8080/index.html

---

## 📋 COMPLETE WORKFLOW TEST

### **PHASE 1: STUDENT LOGIN & GENERATE GATE PASS**

**Step 1.1: Login as Student**
```
Email: student@example.com
Password: password123
Portal: Student Portal
```

**Step 1.2: Fill Gate Pass Form**
- Year: Select from dropdown (e.g., "2nd Year")
- Reason: Enter reason (e.g., "Medical Appointment")
- Time Out: Enter time (e.g., "14:00")
- Click "Generate Gate Pass"

**Expected Result:**
- ✅ Preview appears with jsPDF preview
- ✅ Gate pass NOT saved to localStorage
- ✅ Status visible: "pending_approval"
- ⚠️ Database: NOT yet created

**Verify in Browser Console:**
```javascript
// Should show only preview data, NOT in history
localStorage.getItem('gatePass')  // Should be null or empty
```

---

### **PHASE 2: SEND TO HOD**

**Step 2.1: Click "Send to HOD" Button**
- Confirm all fields filled (Year, Reason, TimeOut)
- Click "Send to HOD"

**Expected Result:**
- ✅ Gate pass stored on backend with status="pending_approval"
- ✅ Toast message: "Gate Pass sent to HOD for approval"
- ✅ Form cleared
- ✅ Gate pass NOT visible in student history yet
- ✅ Database has: `{studentName, studentRoll, studentYear, reason, timeOut, status: "pending_approval"}`

**Verify in Backend:**
```bash
# Check MongoDB
db.gatepasses.findOne({status: "pending_approval"})
# Should return:
# {
#   _id: ObjectId(...),
#   studentName: "Student Name",
#   studentYear: "2nd Year",
#   reason: "Medical Appointment",
#   timeOut: "14:00",
#   status: "pending_approval"
# }
```

---

### **PHASE 3: HOD APPROVAL**

**Step 3.1: Login as HOD**
```
Email: hod@example.com
Password: password123
Portal: HOD Portal
```

**Step 3.2: View Gate Pass Requests**
- Navigate to "Gate Pass Requests" tab
- Should see the gate pass from Step 1.2 with status: pending_approval

**Step 3.3: Check Displayed Data**
- ✅ Year: "2nd Year" (not "—")
- ✅ Reason: "Medical Appointment" (not "—")
- ✅ Time Out: "14:00" (not "—")
- ✅ Student Name: Visible
- ✅ Department: Visible (if added)

**Step 3.4: Click "Approve"**
- Click the Approve button for the gate pass

**Expected Result:**
- ✅ No 404 error
- ✅ Toast message: "Gate Pass approved successfully"
- ✅ Gate pass disappears from HOD pending list
- ✅ Status in database changed from "pending_approval" to "approved"

**If 404 Error Occurs:**
1. Check browser console for exact error
2. Note the gate pass ID
3. Verify gate pass exists in MongoDB with that ID
4. Check if backend is using correct ID lookup

---

### **PHASE 4: STUDENT HISTORY & DOWNLOAD**

**Step 4.1: Login Back as Student**
```
Email: student@example.com
```

**Step 4.2: Check Gate Pass History**
- Navigate to "Gate Pass" section
- Should NOW see the gate pass with status: "approved"

**Expected Result:**
- ✅ Gate pass visible ONLY after HOD approval
- ✅ Status shows: "Approved"
- ✅ Download button enabled

**Step 4.3: Download Gate Pass**
- Click "Download as PDF"

**Expected Result:**
- ✅ PDF downloads with all details
- ✅ Filename: `gatepass_[StudentName]_[Date].pdf`
- ✅ PDF contains: StudentName, Roll, Year, Reason, TimeOut, Approval Date

---

## 🔍 DEBUGGING STEPS IF ISSUES OCCUR

### **Issue: Gate pass appears in history immediately**
**Solution:** Clear localStorage and refresh
```javascript
localStorage.clear();
location.reload();
```

### **Issue: Year/Reason/TimeOut showing as "—" in HOD portal**
**Solution:** Check if backend model has these fields
```bash
# In browser console, check what's being sent:
console.log("Gate pass data:", JSON.parse(localStorage.getItem('currentGatePass')));
```

### **Issue: 404 Error on Approve**
**Solution Steps:**
1. Get the gate pass ID from console error
2. Test in backend:
```bash
curl -X GET http://localhost:8080/api/gatepasses
# Check if ID matches what's being sent
```
3. If ID format is wrong, check ObjectId encoding
4. Verify gate pass actually exists in MongoDB before approving

### **Issue: Server not responding**
**Solution:**
```bash
# Check if server is running
netstat -ano | findstr 8080

# Restart if needed
taskkill /PID <PID> /F
cd 'c:\Users\kswat\Downloads\cctv (1)\cctv\server-java'
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

---

## 📊 EXPECTED DATABASE STATE AFTER WORKFLOW

### **After Step 2 (Send to HOD):**
```javascript
{
  _id: ObjectId("xxx"),
  studentName: "Student Name",
  studentRoll: "2101",
  studentYear: "2nd Year",
  department: "Computer Science",
  studentEmail: "student@example.com",
  reason: "Medical Appointment",
  timeOut: "14:00",
  status: "pending_approval",
  userId: "student-id",
  hodSectionId: "section-id"
}
```

### **After Step 4.1 (HOD Approves):**
```javascript
{
  _id: ObjectId("xxx"),
  studentName: "Student Name",
  studentRoll: "2101",
  studentYear: "2nd Year",
  department: "Computer Science",
  studentEmail: "student@example.com",
  reason: "Medical Appointment",
  timeOut: "14:00",
  status: "approved",  // ← Changed from "pending_approval"
  userId: "student-id",
  hodSectionId: "section-id",
  approvedAt: ISODate("2025-10-31T...")
}
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Server running on port 8080
- [ ] Student can login
- [ ] Student can fill and generate gate pass preview
- [ ] Gate pass NOT in history after generation
- [ ] Student can send to HOD
- [ ] HOD can login and see pending requests
- [ ] HOD sees Year, Reason, TimeOut (not "—")
- [ ] HOD can approve without 404 error
- [ ] Student sees gate pass in history after approval
- [ ] Student can download approved gate pass as PDF

---

## 🚀 READY TO TEST!

App is running at: **http://localhost:8080/index.html**

Test user credentials:
- **Student**: student@example.com / password123
- **HOD**: hod@example.com / password123

