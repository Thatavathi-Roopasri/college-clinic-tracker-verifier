# ✅ GATE PASS SYSTEM - TESTING CHECKLIST

Print this out and check off as you go!

---

## 📋 PRE-TEST VERIFICATION

- [ ] **Server Running**: `netstat -ano | findstr 8080` shows Java process
- [ ] **Database Connected**: Server logs show "Tomcat started on port 8080"
- [ ] **App Accessible**: http://localhost:8080/index.html loads
- [ ] **No Errors**: Browser console is clean (no red errors)
- [ ] **Documentation Ready**: All guide files available

---

## 🧪 PHASE 1: STUDENT GENERATION & PREVIEW

### Test: Generate Gate Pass Preview

- [ ] 1.1 - Login as: `student@example.com` / `password123`
- [ ] 1.2 - Navigate to: Student Portal → Letter Type
- [ ] 1.3 - Select: "Gate Pass" from dropdown
- [ ] 1.4 - Fill Form:
  - [ ] Student Name: (auto-populated)
  - [ ] Roll Number: (auto-populated)
  - [ ] Year: Select "2nd Year" (or any)
  - [ ] Reason: Enter "Medical Appointment"
  - [ ] TimeOut: Enter "14:00"
- [ ] 1.5 - Click: "Generate Gate Pass"
- [ ] 1.6 - Verify Preview Modal appears:
  - [ ] PDF preview visible
  - [ ] All data displayed in preview
  - [ ] "Send to HOD" button visible
  - [ ] "Cancel" button visible
- [ ] 1.7 - Verify NOT stored:
  - [ ] Open browser DevTools → Console
  - [ ] Run: `console.log(localStorage.getItem('gatePass'))`
  - [ ] Should be: `null` or empty
  - [ ] Gate pass NOT in history yet

### Notes:
```
Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 2: SEND TO HOD

### Test: Send Gate Pass Request

- [ ] 2.1 - Click: "Send to HOD" button
- [ ] 2.2 - Verify Response:
  - [ ] Toast message appears: "Gate pass sent to HOD for approval"
  - [ ] No 404 or 500 error
  - [ ] Form clears (fields reset)
  - [ ] "Send to HOD" button disabled
- [ ] 2.3 - Check Browser Console:
  - [ ] Open DevTools → Console
  - [ ] Look for: "✅ Gate pass received by HOD:"
  - [ ] Note the Gate Pass ID (you'll need this)
- [ ] 2.4 - Verify Database:
  - [ ] Gate pass created in MongoDB
  - [ ] Status: `"pending_approval"`
  - [ ] All fields present: studentYear, reason, timeOut, department, etc.

### Notes:
```
Gate Pass ID (for next phase): ___________________

Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 3: HOD REVIEWS REQUEST

### Test: HOD Portal Displays Gate Pass

- [ ] 3.1 - Logout as Student
- [ ] 3.2 - Login as HOD: `hod@example.com` / `password123`
- [ ] 3.3 - Navigate to: HOD Portal → Gate Pass Requests
- [ ] 3.4 - Verify Request Visible:
  - [ ] Gate pass from Student appears
  - [ ] Student Name visible
  - [ ] Roll Number visible
  - [ ] Status: "⏳ Pending Approval"
- [ ] 3.5 - CHECK CRITICAL FIELDS (not showing as "—"):
  - [ ] Year: Should show "2nd Year" ✅ (NOT "—")
  - [ ] Reason: Should show "Medical Appointment" ✅ (NOT "—")
  - [ ] TimeOut: Should show "14:00" ✅ (NOT "—")
  - [ ] Department: Should show value ✅ (if available)
- [ ] 3.6 - Verify Buttons:
  - [ ] "✅ Approve" button visible
  - [ ] "❌ Decline" button visible
  - [ ] Both buttons clickable

### Notes:
```
Year shows: _________________ (should be "2nd Year", not "—")
Reason shows: _________________ (should be "Medical Appointment", not "—")
TimeOut shows: _________________ (should be "14:00", not "—")

Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 4: HOD APPROVAL

### Test: Approve Gate Pass

- [ ] 4.1 - Click: "✅ Approve" button for the gate pass
- [ ] 4.2 - Verify Approval Success:
  - [ ] No 404 error ✅ (THIS WAS THE CRITICAL BUG)
  - [ ] No 500 error
  - [ ] Toast message: "Gate Pass approved successfully"
  - [ ] Gate pass disappears from pending list
- [ ] 4.3 - Verify Status Changed:
  - [ ] Browser Console → Network tab
  - [ ] Look for PATCH request: `/gatepasses/{id}/approve`
  - [ ] Response status should be: **200 OK** (not 404)
  - [ ] Response body should have: `"status": "approved"`
- [ ] 4.4 - Verify in Database:
  - [ ] Gate pass document status: `"approved"`
  - [ ] Field `approvedAt` has timestamp

### Notes:
```
PATCH Response Status: _________ (should be 200)
Response Status Field: _________ (should be "approved")

Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 5: STUDENT SEES IN HISTORY

### Test: Approved Gate Pass Visible in Student History

- [ ] 5.1 - Logout as HOD
- [ ] 5.2 - Login back as Student: `student@example.com` / `password123`
- [ ] 5.3 - Navigate to: Student Portal → Gate Pass (or appropriate section)
- [ ] 5.4 - Verify Gate Pass in History:
  - [ ] Gate pass NOW appears in history ✅ (was hidden before approval)
  - [ ] Status shows: "✅ Approved"
  - [ ] Reason displays: "Medical Appointment"
  - [ ] TimeOut displays: "14:00"
- [ ] 5.5 - Verify Buttons:
  - [ ] "📥 Download as PDF" button visible ✅ (enabled)
  - [ ] "❌ Decline" button NOT visible (no longer needed)
- [ ] 5.6 - Verify NOT showing earlier:
  - [ ] Gate pass appeared ONLY after HOD approval
  - [ ] Did NOT appear immediately after generation
  - [ ] Did NOT appear immediately after sending to HOD

### Notes:
```
Gate pass visible in history: ✅ YES / ❌ NO
Status shows: "✅ Approved": ✅ YES / ❌ NO
Download button enabled: ✅ YES / ❌ NO

Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 6: PDF DOWNLOAD

### Test: Download Gate Pass as PDF

- [ ] 6.1 - Click: "📥 Download as PDF"
- [ ] 6.2 - Verify PDF Downloaded:
  - [ ] PDF file downloads (check browser downloads folder)
  - [ ] Filename format: `gatepass_StudentName_Date.pdf`
  - [ ] No errors in browser console
- [ ] 6.3 - Open PDF and Verify Content:
  - [ ] Student Name: "John Doe" ✅
  - [ ] Roll Number: "2101" ✅
  - [ ] Year: "2nd Year" ✅
  - [ ] Reason: "Medical Appointment" ✅
  - [ ] TimeOut: "14:00" ✅
  - [ ] Approval Date: Shows today's date ✅
  - [ ] Gate Pass ID: Visible ✅
- [ ] 6.4 - Verify PDF Quality:
  - [ ] Text readable ✅
  - [ ] Layout clean ✅
  - [ ] All data formatted nicely ✅

### Notes:
```
PDF downloaded: ✅ YES / ❌ NO
PDF filename: _________________________________
PDF contains all fields: ✅ YES / ❌ NO

Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🧪 PHASE 7: DECLINE TEST (Optional but Recommended)

### Test: HOD Declines Gate Pass

- [ ] 7.1 - Create another gate pass as Student (repeat Phase 1-2)
- [ ] 7.2 - Login as HOD (Phase 3)
- [ ] 7.3 - Click: "❌ Decline" button
- [ ] 7.4 - Enter Reason: "Invalid documentation"
- [ ] 7.5 - Verify Decline:
  - [ ] Toast: "Gate pass declined"
  - [ ] Request disappears from HOD list
  - [ ] Gate pass marked as "declined" in database
- [ ] 7.6 - Student Checks History:
  - [ ] Gate pass appears with status: "❌ Declined"
  - [ ] Decline reason visible: "Invalid documentation"
  - [ ] Download button NOT visible (disabled for declined)

### Notes:
```
Result: ✅ PASS / ❌ FAIL

Issues (if any):
_________________________________________
_________________________________________
```

---

## 🔍 ADDITIONAL VERIFICATION

### Browser Console Check
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for errors (red text): ❌ None should appear
- [ ] Look for warnings: ⚠️ Warnings OK (some framework warnings expected)
- [ ] Check for network errors: ❌ No 404 or 500 errors

### MongoDB Verification
- [ ] Find gate pass in MongoDB:
  ```javascript
  db.gatepasses.findOne({studentName: "John Doe"})
  ```
- [ ] Verify fields present:
  - [ ] `studentYear`: "2nd Year"
  - [ ] `reason`: "Medical Appointment"
  - [ ] `timeOut`: "14:00"
  - [ ] `status`: "approved"
  - [ ] `approvedAt`: Timestamp present

### Server Logs Check
- [ ] Check terminal/server logs:
  - [ ] No fatal errors
  - [ ] All PATCH/POST requests logged
  - [ ] MongoDB operations successful

---

## 📊 FINAL SCORE

Total tests completed: _____ / 7 phases

- **Phase 1 (Generation)**: ✅ PASS / ❌ FAIL
- **Phase 2 (Send to HOD)**: ✅ PASS / ❌ FAIL
- **Phase 3 (HOD Reviews)**: ✅ PASS / ❌ FAIL
- **Phase 4 (HOD Approves)**: ✅ PASS / ❌ FAIL
- **Phase 5 (Student History)**: ✅ PASS / ❌ FAIL
- **Phase 6 (PDF Download)**: ✅ PASS / ❌ FAIL
- **Phase 7 (Optional Decline)**: ✅ PASS / ❌ FAIL

---

## 🎯 SUCCESS CRITERIA

**ALL items must be checked for PRODUCTION RELEASE:**

- [ ] All 6 mandatory phases PASS
- [ ] No 404 errors on approval
- [ ] Year/Reason/TimeOut NOT showing as "—"
- [ ] Gate pass hidden before HOD approval
- [ ] Gate pass visible after HOD approval
- [ ] PDF downloads successfully
- [ ] No console errors
- [ ] Database persisting correctly

---

## ❌ FAILURE INVESTIGATION

If any test fails, follow this:

1. **Check**: API_DEBUG_GUIDE.md (manual API testing)
2. **Check**: FINAL_WORKFLOW_TEST.md (detailed explanation)
3. **Check**: Browser console for specific error messages
4. **Check**: Server logs for backend errors
5. **Verify**: Gate pass exists in MongoDB (ID lookup)
6. **Restart**: Server if needed (see QUICK_REFERENCE.md)

---

## 🎉 COMPLETION

When ALL tests pass:

✅ **System is ready for production use!**

```
┌──────────────────────────────────────────┐
│   GATE PASS WORKFLOW SYSTEM VERIFIED     │
│                                          │
│    ✅ All tests passing                 │
│    ✅ No critical errors                │
│    ✅ Data persisting correctly         │
│    ✅ User workflows functional         │
│    ✅ Ready for deployment              │
└──────────────────────────────────────────┘
```

**Test Date**: ________________
**Tester Name**: ________________
**Overall Status**: 🟢 PASS / 🔴 FAIL

---

## 📝 ADDITIONAL NOTES

_Use this space to record any observations, issues, or improvements:_

```


________________________________________________________
________________________________________________________
________________________________________________________
________________________________________________________
```

---

**Document Version**: 1.0
**Last Updated**: October 31, 2025
**Status**: Ready for Testing ✅

