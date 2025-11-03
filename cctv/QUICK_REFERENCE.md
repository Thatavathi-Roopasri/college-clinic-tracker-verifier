# 🚀 QUICK REFERENCE - GATE PASS SYSTEM

## 📌 CURRENT STATUS
- ✅ Server: Running (http://localhost:8080)
- ✅ Database: Connected (MongoDB Atlas)
- ✅ App: Ready (http://localhost:8080/index.html)

---

## 🔑 LOGIN CREDENTIALS

### Student Portal
```
Email: student@example.com
Password: password123
```

### HOD Portal
```
Email: hod@example.com
Password: password123
```

---

## 🎯 WORKFLOW STEPS

### Student Side
1. **Login** → Select "Gate Pass" from letter type
2. **Fill Form** → Year, Reason, TimeOut (all required)
3. **Generate** → See preview (NOT saved yet)
4. **Send to HOD** → Send to backend for approval
5. **Wait** → HOD reviews and approves/declines
6. **Check History** → See result after HOD action
7. **Download PDF** → If approved, download as PDF

### HOD Side
1. **Login** → Navigate to Gate Pass Requests
2. **Review** → See pending requests with all details
3. **Approve/Decline** → Click button
4. **Done** → Request processed

---

## 📊 KEY DATA FIELDS

| Field | Where Set | Required | Purpose |
|-------|-----------|----------|---------|
| Year | Student Form | ✅ Yes | Displayed in HOD portal |
| Reason | Student Form | ✅ Yes | Displayed in HOD portal |
| TimeOut | Student Form | ✅ Yes | Displayed in HOD portal |
| Department | Auto-populated | ✅ Yes | For filtering/organization |
| Student Email | Auto from login | ✅ Yes | For notifications |
| Status | Backend | Auto | pending_approval → approved/declined |

---

## 🌐 API ENDPOINTS

```
GET    /api/gatepasses                    → All gate passes
GET    /api/gatepasses/user/{userId}      → User's gate passes
POST   /api/gatepasses                    → Create new
PATCH  /api/gatepasses/{id}/approve       → Approve
PATCH  /api/gatepasses/{id}/decline       → Decline
```

---

## 🔍 DEBUGGING QUICK FIXES

### Issue: Gate pass in history before approval
```javascript
localStorage.clear(); location.reload();
```

### Issue: Year/Reason/TimeOut showing as "—"
1. Verify form filled
2. Check MongoDB: `db.gatepasses.findOne({})`
3. Verify fields exist in document

### Issue: 404 Error on Approve
1. Check gate pass exists: `db.gatepasses.find()`
2. Verify ID matches exactly
3. Restart server if needed

### Issue: Server not responding
```bash
netstat -ano | findstr 8080
# If found: Kill it with: taskkill /PID <PID> /F
# Restart: java -jar server-java/target/clinic-server-0.0.1-SNAPSHOT.jar
```

---

## 📁 KEY FILES

| File | Purpose | Modified |
|------|---------|----------|
| `script.js` | Frontend logic | ✅ Yes |
| `index.html` | UI structure | No |
| `GatePass.java` | Model/database | ✅ Yes |
| `GatePassService.java` | Approval logic | ✅ Yes |
| `GatePassController.java` | REST endpoints | No |

---

## 📚 DOCUMENTATION

- **STATUS_REPORT.md** - Complete implementation details
- **FINAL_WORKFLOW_TEST.md** - Step-by-step testing guide
- **API_DEBUG_GUIDE.md** - Manual API testing with curl
- **IMPLEMENTATION_SUMMARY.md** - System overview

---

## ✅ SUCCESS INDICATORS

✅ **Working if you can:**
1. Generate gate pass preview
2. Send to HOD without error
3. HOD sees all fields (not "—")
4. HOD can approve without 404
5. Student sees in history after approval
6. PDF downloads successfully

---

## 🎊 READY TO USE!

**Everything is set up. Go to:**
👉 **http://localhost:8080/index.html**

**Test the complete workflow using the guide:**
📖 **FINAL_WORKFLOW_TEST.md**

**Questions? Check:**
🔧 **API_DEBUG_GUIDE.md**

---

## 📞 TROUBLESHOOTING

```
Can't access http://localhost:8080?
→ Check if server running: netstat -ano | findstr 8080
→ Restart if needed: See "Issue: Server not responding" above

Errors in browser console?
→ Try: localStorage.clear(); location.reload();
→ Check: API_DEBUG_GUIDE.md for manual testing

Database issues?
→ Verify MongoDB connection
→ Check: application.properties credentials
→ Verify IP whitelist in MongoDB Atlas

Something else?
→ Check STATUS_REPORT.md for detailed info
```

---

**Status: 🟢 OPERATIONAL & READY**

All systems running. Database connected. App loaded.
Ready for full testing!

