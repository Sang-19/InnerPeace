# Community Reporting System - Admin Approval Workflow

## Overview
This document describes the updated community reporting system where reported messages are not immediately removed but instead require admin review and approval.

## Key Changes Made

### 1. Updated Data Types (`src/lib/types.ts`)
- Modified `CommunityReport` type to include:
  - New status options: `'pending' | 'approved' | 'rejected'`
  - `reviewedBy?: string` - Name of the admin who reviewed
  - `reviewedAt?: Date` - Timestamp of review
  - `adminComment?: string` - Optional comment from admin

### 2. Modified Reporting Action (`src/lib/actions.ts`)
- Updated `reportCommunityMessage()`:
  - **Removed immediate message hiding** - messages remain visible until admin review
  - Added admin notifications when reports are submitted
  - Reports now go to "pending" status awaiting admin review

- Added new admin actions:
  - `approveReportedMessage()` - Hides the message and marks report as approved
  - `rejectReportedMessage()` - Keeps message visible and marks report as rejected

### 3. Enhanced Admin Interface (`src/components/admin/community-reports.tsx`)
- Completely redesigned the reports interface:
  - **Remove Button**: Approves the report and hides the message
  - **Keep Button**: Rejects the report and keeps the message visible
  - **View Button**: Shows full message content and admin comments
  - Admin comment functionality for explaining decisions
  - Status tracking with color-coded badges
  - Shows who reviewed each report and when

### 4. Updated Chat Display Logic (`src/app/student/community/page.tsx`)
- Modified message visibility logic:
  - Shows all messages except those with status `'hidden'`
  - Includes messages that are reported but not yet admin-approved for removal
  - Only hides messages after admin explicitly approves their removal

### 5. Admin Notification System
- Automatic notifications sent to all admins when new reports are submitted
- Notifications include report type and require admin attention

## Workflow

### Student Reports a Message
1. Student clicks "Report" on a message
2. Report is created with status "pending"
3. **Message remains visible** to all users
4. All admins receive notifications about the new report

### Admin Reviews Report
1. Admin goes to Reports page (`/admin/reports`)
2. Sees pending reports with full message content
3. Has two options:
   - **Remove**: Approves the report, hides the message, marks as "approved"
   - **Keep**: Rejects the report, keeps message visible, marks as "rejected"
4. Can add comments explaining the decision

### Message Visibility Rules
- **Visible**: Normal message, shows to everyone
- **Reported** (but pending): Still shows to everyone until admin review
- **Hidden**: Only after admin approval, hidden from all users
- **Admin Decision Logged**: All decisions are tracked with admin name, timestamp, and optional comments

## Benefits of This System

1. **Prevents Abuse**: False reports cannot immediately remove legitimate messages
2. **Admin Oversight**: Human review ensures fair moderation decisions
3. **Transparency**: All admin decisions are logged and can be reviewed
4. **Reversibility**: Admin comments help explain decisions for future reference
5. **User Trust**: Messages remain visible unless genuinely problematic
6. **Accountability**: Full audit trail of who made what moderation decisions

## Database Structure

### Community Reports Collection
```
community-reports/
├── reportId/
    ├── messageId: string
    ├── studentId: string  
    ├── studentName: string
    ├── message: string
    ├── date: timestamp
    ├── status: 'pending' | 'approved' | 'rejected'
    ├── reviewedBy?: string
    ├── reviewedAt?: timestamp
    └── adminComment?: string
```

### Community Chat Messages
```
community-chat/
├── messageId/
    ├── senderId: string
    ├── message: string
    ├── timestamp: timestamp
    ├── isHarmful: boolean
    └── status: 'visible' | 'reported' | 'hidden'
```

## Admin Notification Types
- `community_report`: New message reported, needs admin review
- `emergency_alert`: Student emergency alert (existing)

This system ensures fair, transparent, and accountable community moderation while preventing abuse of the reporting mechanism.
