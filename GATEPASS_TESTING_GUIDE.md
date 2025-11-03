# Gate Pass Workflow - Testing Guide

## 🔧 Debugging the 404 Error

The error `PATCH /gatepasses/6904f15dbb0c54a61ed46fbc/approve failed 404` means the gate pass ID is not being found in the database.

### **Steps to Debug:**

1. **Open Browser Developer Console** (F12)
   - Go to "Console" tab
   - This will show all API requests and responses

2. **Check the Gate Pass ID in HOD Portal**
   - Login as HOD
   - Go to HOD Portal
   - Look for logs like: `🔍 Raw object: {...}`
   - Find the `_id` field - this is the MongoDB ID

3. **Check if Gate Pass was Created**
   - Student fills form and clicks "Send to HOD"
   - Check Network tab (F12 → Network)
   - Look for POST request to `/api/gatepasses`
   - Verify response has `_id` field with value like `6904f15dbb0c54a61ed46fbc`

4. **Manual Database Check** (if needed)
   - Use MongoDB Compass
   - Connect to: `mongodb+srv://Project01:<password>@project01.bmejhvq.mongodb.net/`
   - Look in `gatepasses` collection
   - Verify document with ID `6904f15dbb0c54a61ed46fbc` exists

---

## 🧪 Complete Testing Workflow

### **Phase 1: Student Creates Gate Pass**

```
1. Login as Student: swathi@klh.edu.in / password123
2. Click "Letters" menu → "Letter Generator"
3. Select "Gate Pass" from dropdown
4. Fill Form:
   - Student Name: Swathi
   - Year: 2nd Year
   - Department: CSE
   - Roll Number: 241003001
   - Reason for Leaving: Sick
   - Time Out: 22:32
5. Click "Generate Pass" → Preview should appear
   ✅ Check: History should still be empty
6. Click "Send to HOD" → Should see "✓ Sent - Awaiting approval"
   ✅ Check: Gate pass sent to server
```

### **Phase 2: HOD Reviews Request**

```
1. Logout and Login as HOD: hod@klh.edu.in / password123
2. Click "HOD Portal" from menu
3. Should see pending gate pass with:
   - Name: Swathi
   - Roll: 241003001
   - Year: 2nd Year
   - Reason: Sick
   - Time Out: 22:32
4. Open Browser Console (F12)
5. Click "Approve" button
   🔍 Check Console logs:
   - Should see: "🔍 Approving gate pass ID: [ID]"
   - Should see: "📤 Making PATCH request to: http://localhost:8080/api/gatepasses/[ID]/approve"
   - If 404: The [ID] doesn't exist in database
```

### **Phase 3: Check Database**

If you get 404 error, check:

```javascript
// In Browser Console, run:
fetch('http://localhost:8080/api/gatepasses')
  .then(r => r.json())
  .then(data => {
    console.log('All gate passes:', data);
    console.log('Count:', data.length);
    data.forEach(gp => {
      console.log('ID:', gp._id, 'Status:', gp.status, 'Name:', gp.studentName);
    });
  });
```

---

## 🛠️ Common Issues & Fixes

### **Issue 1: 404 on Approve**
**Cause:** Gate pass ID doesn't exist in database
**Fix:**
- Ensure student actually clicked "Send to HOD" (not just "Generate")
- Check that POST request succeeded (check Network tab)
- Restart server if data wasn't persisted

### **Issue 2: Year/Reason/TimeOut showing as "—"**
**Cause:** Fields not being sent from frontend
**Fix:**
- Already fixed in code - redeploy JS files
- Hard refresh browser (Ctrl+Shift+R)

### **Issue 3: Gate pass not appearing in HOD portal**
**Cause:** Filter or fetch issue
**Fix:**
- Check Network tab for GET `/api/gatepasses` response
- Verify `status` is exactly `"pending_approval"`
- Check browser console for errors

---

## 📋 Data Fields Being Sent

When student clicks "Send to HOD", this data is sent:

```json
{
  "studentEmail": "swathi@klh.edu.in",
  "studentName": "Swathi",
  "studentRoll": "241003001",
  "studentYear": "2nd Year",
  "department": "CSE",
  "reason": "Sick",
  "timeOut": "22:32",
  "status": "pending_approval",
  "userId": "swathi@klh.edu.in",
  "hodSectionId": "",
  "hodUserId": ""
}
```

MongoDB will assign `_id` automatically.

---

## ✅ Expected Outcomes

| Step | Expected Result |
|------|-----------------|
| Generate Pass | Preview shows, History empty |
| Send to HOD | Message "Sent", Request sent to server |
| HOD Views List | Pending request appears |
| HOD Clicks Approve | ✅ Success message |
| Student History | Shows "Approved" badge + Download button |
| Download | PDF file downloads |

---

## 🔗 Relevant Files Modified

- `script.js` - Frontend logic for gate pass workflow
- `GatePass.java` - Backend model (added `department`, `studentEmail` fields)
- `GatePassService.java` - Backend approval logic (status → "approved")

