package com.example.clinicserver.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "gatepasses")
public class GatePass {
    @Id
    private String id;
    
    private String userId; // Student/User who received the gate pass
    private String portalId; // Which portal issued this
    private String sectionId; // Section the user belongs to
    private String passNumber; // Unique pass identifier
    private String status; // pending_approval, active, expired, revoked, used, declined
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private String issuerUserId; // Admin/Faculty who issued the pass
    private String remarks;
    private String hodSectionId; // HOD section that needs to approve this
    private String hodUserId; // HOD user who will approve/decline
    private LocalDateTime approvedAt;
    private LocalDateTime declinedAt;
    private String declineReason;
    
    // Student details for HOD view
    private String studentName;
    private String studentRoll;
    private String studentEmail;
    private String reason;
    private String timeOut;
    private String studentYear;
    private String department;

    public GatePass() {
        this.issuedAt = LocalDateTime.now();
        this.status = "pending_approval";
    }

    public GatePass(String userId, String portalId, String sectionId, String passNumber) {
        this.userId = userId;
        this.portalId = portalId;
        this.sectionId = sectionId;
        this.passNumber = passNumber;
        this.issuedAt = LocalDateTime.now();
        this.status = "pending_approval";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPortalId() { return portalId; }
    public void setPortalId(String portalId) { this.portalId = portalId; }

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getPassNumber() { return passNumber; }
    public void setPassNumber(String passNumber) { this.passNumber = passNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public String getIssuerUserId() { return issuerUserId; }
    public void setIssuerUserId(String issuerUserId) { this.issuerUserId = issuerUserId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRoll() { return studentRoll; }
    public void setStudentRoll(String studentRoll) { this.studentRoll = studentRoll; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getTimeOut() { return timeOut; }
    public void setTimeOut(String timeOut) { this.timeOut = timeOut; }

    public String getStudentYear() { return studentYear; }
    public void setStudentYear(String studentYear) { this.studentYear = studentYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getHodSectionId() { return hodSectionId; }
    public void setHodSectionId(String hodSectionId) { this.hodSectionId = hodSectionId; }

    public String getHodUserId() { return hodUserId; }
    public void setHodUserId(String hodUserId) { this.hodUserId = hodUserId; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getDeclinedAt() { return declinedAt; }
    public void setDeclinedAt(LocalDateTime declinedAt) { this.declinedAt = declinedAt; }

    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
