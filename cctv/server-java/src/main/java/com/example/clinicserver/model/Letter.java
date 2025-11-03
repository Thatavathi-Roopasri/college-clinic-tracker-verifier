package com.example.clinicserver.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "letters")
public class Letter {
    @Id
    private String id;
    
    private String userId; // Recipient user (student/faculty)
    private String portalId; // Which portal issued this
    private String sectionId; // Section the user belongs to
    private String letterNumber; // Unique letter identifier
    private String letterType; // sick-leave, permission, complaint, notice, etc.
    private String title;
    private String content;
    private String status; // draft, issued, acknowledged, expired
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime acknowledgedAt;
    private String issuerUserId; // Admin/Faculty who issued the letter
    private String approverUserId; // HOD/Admin who approved (if needed)
    private String attachmentUrl; // Path to PDF or document
    private String remarks;

    public Letter() {
        this.issuedAt = LocalDateTime.now();
        this.status = "draft";
    }

    public Letter(String userId, String portalId, String sectionId, String letterNumber, String letterType) {
        this.userId = userId;
        this.portalId = portalId;
        this.sectionId = sectionId;
        this.letterNumber = letterNumber;
        this.letterType = letterType;
        this.issuedAt = LocalDateTime.now();
        this.status = "draft";
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

    public String getLetterNumber() { return letterNumber; }
    public void setLetterNumber(String letterNumber) { this.letterNumber = letterNumber; }

    public String getLetterType() { return letterType; }
    public void setLetterType(String letterType) { this.letterType = letterType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public String getIssuerUserId() { return issuerUserId; }
    public void setIssuerUserId(String issuerUserId) { this.issuerUserId = issuerUserId; }

    public String getApproverUserId() { return approverUserId; }
    public void setApproverUserId(String approverUserId) { this.approverUserId = approverUserId; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
