-- Workforce portal (preview only). Adds EMPLOYEE auth role and scheduling models.

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';

CREATE TYPE "EmployeeClassification" AS ENUM (
  'CAREGIVER',
  'HOME_HEALTH_AIDE',
  'CNA',
  'LPN',
  'RN',
  'HOSPICE_STAFF',
  'TRANSPORTATION_STAFF',
  'SCHEDULER',
  'SUPERVISOR'
);

CREATE TYPE "EmploymentStatus" AS ENUM ('INVITED', 'ACTIVE', 'ON_LEAVE', 'INACTIVE');
CREATE TYPE "ShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED', 'COMPLETED');
CREATE TYPE "ShiftConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');
CREATE TYPE "TimeOffStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CANCELED');
CREATE TYPE "ShiftOfferStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELED', 'EXPIRED');
CREATE TYPE "ShiftResponseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "NoticePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "TimeEntryStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "TimesheetCorrectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "EmployeeInvitation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "classification" "EmployeeClassification" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "acceptedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeInvitation_tokenHash_key" ON "EmployeeInvitation"("tokenHash");
CREATE INDEX "EmployeeInvitation_email_idx" ON "EmployeeInvitation"("email");

CREATE TABLE "EmployeeProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "classification" "EmployeeClassification" NOT NULL,
  "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'INVITED',
  "phone" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
  "department" TEXT,
  "hireDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");
CREATE INDEX "EmployeeProfile_classification_employmentStatus_idx" ON "EmployeeProfile"("classification", "employmentStatus");

CREATE TABLE "EmployeeCredential" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeCredential_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeCredential_profileId_idx" ON "EmployeeCredential"("profileId");

CREATE TABLE "EmployeeAvailability" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "dayOfWeek" INTEGER,
  "startMinutes" INTEGER,
  "endMinutes" INTEGER,
  "unavailableDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeAvailability_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeAvailability_profileId_idx" ON "EmployeeAvailability"("profileId");

CREATE TABLE "EmployeeTimeOffRequest" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT,
  "status" "TimeOffStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId" TEXT,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeTimeOffRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeTimeOffRequest_profileId_status_idx" ON "EmployeeTimeOffRequest"("profileId", "status");
CREATE INDEX "EmployeeTimeOffRequest_startDate_endDate_idx" ON "EmployeeTimeOffRequest"("startDate", "endDate");

CREATE TABLE "ShiftRecurrence" (
  "id" TEXT NOT NULL,
  "rule" JSONB NOT NULL,
  "untilDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShiftRecurrence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Shift" (
  "id" TEXT NOT NULL,
  "title" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "serviceCategory" TEXT NOT NULL,
  "status" "ShiftStatus" NOT NULL DEFAULT 'DRAFT',
  "workLocationLabel" TEXT,
  "schedulingInstructions" TEXT,
  "assignmentReference" TEXT,
  "recurrenceId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Shift_startsAt_endsAt_idx" ON "Shift"("startsAt", "endsAt");
CREATE INDEX "Shift_status_idx" ON "Shift"("status");

CREATE TABLE "ShiftAssignment" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "confirmationStatus" "ShiftConfirmationStatus" NOT NULL DEFAULT 'PENDING',
  "confirmedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShiftAssignment_shiftId_key" ON "ShiftAssignment"("shiftId");
CREATE INDEX "ShiftAssignment_profileId_idx" ON "ShiftAssignment"("profileId");

CREATE TABLE "ShiftOffer" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "status" "ShiftOfferStatus" NOT NULL DEFAULT 'OPEN',
  "requiredClassification" "EmployeeClassification",
  "requiredCredentialName" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShiftOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShiftOffer_shiftId_key" ON "ShiftOffer"("shiftId");

CREATE TABLE "ShiftResponse" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "status" "ShiftResponseStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShiftResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShiftResponse_offerId_profileId_key" ON "ShiftResponse"("offerId", "profileId");
CREATE INDEX "ShiftResponse_profileId_status_idx" ON "ShiftResponse"("profileId", "status");

CREATE TABLE "StaffNotice" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "priority" "NoticePriority" NOT NULL DEFAULT 'NORMAL',
  "requiresAck" BOOLEAN NOT NULL DEFAULT false,
  "targetAll" BOOLEAN NOT NULL DEFAULT true,
  "targetClassification" "EmployeeClassification",
  "targetDepartment" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffNotice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffNoticeRecipient" (
  "id" TEXT NOT NULL,
  "noticeId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "ackAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffNoticeRecipient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffNoticeRecipient_noticeId_profileId_key" ON "StaffNoticeRecipient"("noticeId", "profileId");
CREATE INDEX "StaffNoticeRecipient_profileId_idx" ON "StaffNoticeRecipient"("profileId");

CREATE TABLE "StaffNotification" (
  "id" TEXT NOT NULL,
  "noticeId" TEXT,
  "profileId" TEXT,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffNotification_status_createdAt_idx" ON "StaffNotification"("status", "createdAt");

CREATE TABLE "StaffActivity" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "profileId" TEXT,
  "type" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffActivity_createdAt_idx" ON "StaffActivity"("createdAt");

CREATE TABLE "TimeEntry" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "shiftAssignmentId" TEXT,
  "clockInAt" TIMESTAMP(3) NOT NULL,
  "clockOutAt" TIMESTAMP(3),
  "status" "TimeEntryStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimeEntry_profileId_clockInAt_idx" ON "TimeEntry"("profileId", "clockInAt");

CREATE TABLE "Timesheet" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "totalMinutes" INTEGER NOT NULL DEFAULT 0,
  "exportedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Timesheet_profileId_periodStart_key" ON "Timesheet"("profileId", "periodStart");

CREATE TABLE "TimesheetCorrection" (
  "id" TEXT NOT NULL,
  "timeEntryId" TEXT NOT NULL,
  "requestedInAt" TIMESTAMP(3),
  "requestedOutAt" TIMESTAMP(3),
  "reason" TEXT NOT NULL,
  "status" "TimesheetCorrectionStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId" TEXT,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimesheetCorrection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimesheetCorrection_status_idx" ON "TimesheetCorrection"("status");

-- Foreign keys
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeCredential" ADD CONSTRAINT "EmployeeCredential_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAvailability" ADD CONSTRAINT "EmployeeAvailability_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeTimeOffRequest" ADD CONSTRAINT "EmployeeTimeOffRequest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeTimeOffRequest" ADD CONSTRAINT "EmployeeTimeOffRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "ShiftRecurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftOffer" ADD CONSTRAINT "ShiftOffer_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftResponse" ADD CONSTRAINT "ShiftResponse_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ShiftOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftResponse" ADD CONSTRAINT "ShiftResponse_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftResponse" ADD CONSTRAINT "ShiftResponse_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StaffNotice" ADD CONSTRAINT "StaffNotice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StaffNoticeRecipient" ADD CONSTRAINT "StaffNoticeRecipient_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "StaffNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffNoticeRecipient" ADD CONSTRAINT "StaffNoticeRecipient_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "StaffNotice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StaffActivity" ADD CONSTRAINT "StaffActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_shiftAssignmentId_fkey" FOREIGN KEY ("shiftAssignmentId") REFERENCES "ShiftAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimesheetCorrection" ADD CONSTRAINT "TimesheetCorrection_timeEntryId_fkey" FOREIGN KEY ("timeEntryId") REFERENCES "TimeEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimesheetCorrection" ADD CONSTRAINT "TimesheetCorrection_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
