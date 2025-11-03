# Multi-Portal Clinic Tracker System - API Documentation

## Overview
The Clinic Tracker now supports multiple separate portals, each with their own sections, gate passes, and letters. This allows for segregated access and management across different user roles and departments.

## New Collections in MongoDB

### 1. **Portals** (`portals`)
Defines separate portals in the system.

**Fields:**
- `id` (ObjectId) - Unique identifier
- `name` (String) - Portal name (e.g., "Admin Portal", "Student Portal")
- `description` (String) - Portal description
- `portalType` (String) - Type of portal (admin, student, faculty, clinic, hod)
- `sectionIds` (Array of String) - Sections accessible in this portal
- `userIds` (Array of String) - Users with access to this portal
- `active` (Boolean) - Portal status
- `createdAt` (LocalDateTime) - Creation timestamp
- `updatedAt` (LocalDateTime) - Last update timestamp

**Example Document:**
```json
{
  "_id": "ObjectId(...)",
  "name": "Student Portal",
  "description": "Portal for students to view letters and gate passes",
  "portalType": "student",
  "sectionIds": ["section1", "section2"],
  "userIds": ["user1", "user2", "user3"],
  "active": true,
  "createdAt": "2025-10-30T10:00:00",
  "updatedAt": "2025-10-30T10:00:00"
}
```

---

### 2. **Gate Passes** (`gatepasses`)
Tracks gate passes issued to users for specific portals.

**Fields:**
- `id` (ObjectId) - Unique identifier
- `userId` (String) - User who received the pass
- `portalId` (String) - Portal that issued the pass
- `sectionId` (String) - User's section
- `passNumber` (String) - Unique pass identifier
- `status` (String) - active, expired, revoked, used
- `issuedAt` (LocalDateTime) - Issuance timestamp
- `expiresAt` (LocalDateTime) - Expiration timestamp
- `usedAt` (LocalDateTime) - When the pass was used
- `issuerUserId` (String) - Admin/Faculty who issued
- `remarks` (String) - Additional notes

**Example Document:**
```json
{
  "_id": "ObjectId(...)",
  "userId": "user123",
  "portalId": "portal456",
  "sectionId": "section1",
  "passNumber": "GP-2025-001",
  "status": "active",
  "issuedAt": "2025-10-30T10:00:00",
  "expiresAt": "2025-11-30T10:00:00",
  "usedAt": null,
  "issuerUserId": "admin789",
  "remarks": "Standard monthly pass"
}
```

---

### 3. **Letters** (`letters`)
Tracks letters issued to users through specific portals.

**Fields:**
- `id` (ObjectId) - Unique identifier
- `userId` (String) - Letter recipient
- `portalId` (String) - Portal that issued the letter
- `sectionId` (String) - User's section
- `letterNumber` (String) - Unique letter identifier
- `letterType` (String) - sick-leave, permission, complaint, notice, etc.
- `title` (String) - Letter title
- `content` (String) - Letter content/body
- `status` (String) - draft, issued, acknowledged, expired
- `issuedAt` (LocalDateTime) - Issuance timestamp
- `expiresAt` (LocalDateTime) - Expiration timestamp
- `acknowledgedAt` (LocalDateTime) - When recipient acknowledged
- `issuerUserId` (String) - Admin/Faculty who issued
- `approverUserId` (String) - HOD/Admin who approved
- `attachmentUrl` (String) - PDF or document URL
- `remarks` (String) - Additional notes

**Example Document:**
```json
{
  "_id": "ObjectId(...)",
  "userId": "user123",
  "portalId": "portal456",
  "sectionId": "section1",
  "letterNumber": "LTR-2025-001",
  "letterType": "sick-leave",
  "title": "Sick Leave Letter",
  "content": "This is to certify that...",
  "status": "issued",
  "issuedAt": "2025-10-30T10:00:00",
  "expiresAt": "2025-12-30T10:00:00",
  "acknowledgedAt": "2025-10-30T11:30:00",
  "issuerUserId": "admin789",
  "approverUserId": "hod111",
  "attachmentUrl": "/uploads/letter-001.pdf",
  "remarks": "Approved for 3 days"
}
```

---

## REST API Endpoints

### Portal Endpoints
```
POST   /api/portals                          - Create new portal
GET    /api/portals                          - Get all portals
GET    /api/portals/active                   - Get active portals only
GET    /api/portals/{id}                     - Get portal by ID
GET    /api/portals/name/{name}              - Get portal by name
GET    /api/portals/type/{portalType}        - Get portal by type
GET    /api/portals/section/{sectionId}      - Get portals for a section
GET    /api/portals/user/{userId}            - Get portals accessible by user
PUT    /api/portals/{id}                     - Update portal
POST   /api/portals/{portalId}/sections/{sectionId}    - Add section to portal
DELETE /api/portals/{portalId}/sections/{sectionId}    - Remove section from portal
POST   /api/portals/{portalId}/users/{userId}          - Add user to portal
DELETE /api/portals/{portalId}/users/{userId}          - Remove user from portal
PATCH  /api/portals/{id}/toggle              - Toggle portal active status
DELETE /api/portals/{id}                     - Delete portal
```

### Gate Pass Endpoints
```
POST   /api/gatepasses                            - Create new gate pass
GET    /api/gatepasses                            - Get all gate passes
GET    /api/gatepasses/{id}                       - Get gate pass by ID
GET    /api/gatepasses/number/{passNumber}        - Get gate pass by number
GET    /api/gatepasses/user/{userId}              - Get passes for user
GET    /api/gatepasses/portal/{portalId}          - Get passes for portal
GET    /api/gatepasses/section/{sectionId}        - Get passes for section
GET    /api/gatepasses/status/{status}            - Get passes by status
GET    /api/gatepasses/active                     - Get active passes
GET    /api/gatepasses/user/{userId}/portal/{portalId}  - Get user's passes in portal
PUT    /api/gatepasses/{id}                       - Update gate pass
PATCH  /api/gatepasses/{id}/use                   - Mark pass as used
PATCH  /api/gatepasses/{id}/revoke                - Revoke gate pass
GET    /api/gatepasses/expired/list                - Get expired passes
POST   /api/gatepasses/maintenance/expire-old     - Auto-expire old passes
DELETE /api/gatepasses/{id}                       - Delete gate pass
```

### Letter Endpoints
```
POST   /api/letters                               - Create new letter
GET    /api/letters                               - Get all letters
GET    /api/letters/{id}                          - Get letter by ID
GET    /api/letters/number/{letterNumber}         - Get letter by number
GET    /api/letters/user/{userId}                 - Get letters for user
GET    /api/letters/portal/{portalId}             - Get letters from portal
GET    /api/letters/section/{sectionId}           - Get letters for section
GET    /api/letters/status/{status}               - Get letters by status
GET    /api/letters/type/{letterType}             - Get letters by type
GET    /api/letters/user/{userId}/portal/{portalId}     - Get user's letters in portal
GET    /api/letters/issued-by/{issuerUserId}      - Get letters issued by user
PUT    /api/letters/{id}                          - Update letter
PATCH  /api/letters/{id}/issue                    - Issue letter (draft → issued)
PATCH  /api/letters/{id}/acknowledge              - Acknowledge letter
PATCH  /api/letters/{id}/approve                  - Approve letter
GET    /api/letters/expired/list                  - Get expired letters
POST   /api/letters/maintenance/expire-old        - Auto-expire old letters
DELETE /api/letters/{id}                          - Delete letter
```

---

## Usage Examples

### 1. Creating a Portal
```bash
curl -X POST http://localhost:8080/api/portals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Faculty Portal",
    "description": "Portal for faculty members",
    "portalType": "faculty",
    "sectionIds": ["section1", "section2"],
    "userIds": ["faculty1", "faculty2"]
  }'
```

### 2. Creating a Gate Pass
```bash
curl -X POST http://localhost:8080/api/gatepasses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student123",
    "portalId": "portal456",
    "sectionId": "sectionA",
    "passNumber": "GP-2025-001",
    "expiresAt": "2025-11-30T18:00:00",
    "issuerUserId": "admin789"
  }'
```

### 3. Creating a Letter
```bash
curl -X POST http://localhost:8080/api/letters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student123",
    "portalId": "portal456",
    "sectionId": "sectionA",
    "letterNumber": "LTR-2025-001",
    "letterType": "sick-leave",
    "title": "Medical Certificate",
    "content": "This certifies that the student was unwell on..."
  }'
```

### 4. Getting User's Portals
```bash
curl -X GET http://localhost:8080/api/portals/user/student123
```

### 5. Marking a Gate Pass as Used
```bash
curl -X PATCH http://localhost:8080/api/gatepasses/pass123/use
```

### 6. Issuing a Letter
```bash
curl -X PATCH http://localhost:8080/api/letters/letter123/issue \
  -H "Content-Type: application/json" \
  -d 'issuerUserId=admin789'
```

---

## Data Flow Diagram

```
User (Student/Faculty)
    ↓
Portal (Student Portal / Faculty Portal / Admin Portal)
    ├── Sections (Section A, B, C...)
    ├── Gate Passes
    │   ├── Issued
    │   ├── Active
    │   ├── Used
    │   ├── Revoked
    │   └── Expired
    └── Letters
        ├── Draft
        ├── Issued
        ├── Acknowledged
        └── Expired
```

---

## Integration with Existing Models

### User Model Enhancement
Extend the `User` model to link with portals:
```java
private List<String> portalIds; // Portals user has access to
```

### Section Model Enhancement
Extend the `Section` model to link with portals:
```java
private List<String> portalIds; // Portals this section belongs to
```

---

## Future Enhancements

1. **Workflow Management** - Approval workflows for letters
2. **Notifications** - Email/SMS notifications for pass expiry and letter status
3. **Analytics** - Dashboard for tracking pass usage and letter statistics
4. **Document Management** - File upload and storage for letter attachments
5. **Audit Trail** - Complete audit logs for all portal activities
6. **Bulk Operations** - Batch creation of passes and letters
7. **Recurring Passes** - Automated renewal of passes
8. **Template Management** - Letter templates for different types

---

## Status Values

### Gate Pass Status
- `active` - Currently valid
- `expired` - Past expiration date
- `revoked` - Canceled by admin
- `used` - Already used

### Letter Status
- `draft` - Created but not issued
- `issued` - Published to recipient
- `acknowledged` - Recipient has acknowledged
- `expired` - Past expiration date

---

## Notes

- All timestamps are in ISO 8601 format
- Port: 8080 (configurable via `application.properties`)
- Database: MongoDB (configure via `MONGO_URI` environment variable)
- CORS is enabled for all origins for development (configure as needed)
