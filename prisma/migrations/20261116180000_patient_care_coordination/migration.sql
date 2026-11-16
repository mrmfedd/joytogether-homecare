-- Patient care coordination (additive; safe for preview/staging migration review before production).

CREATE TYPE "PatientServiceType" AS ENUM (
  'SKILLED_NURSING',
  'HOSPICE',
  'PRIVATE_DUTY',
  'PATIENT_TRANSPORTATION'
);

CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'PENDING', 'ON_HOLD', 'DISCHARGED', 'INACTIVE');

CREATE TYPE "PatientAssignmentStatus" AS ENUM ('ACTIVE', 'PENDING', 'ENDED', 'CANCELED');

CREATE TYPE "PatientVisitStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW');

CREATE TYPE "CareNoteCategory" AS ENUM (
  'DAILY_CARE',
  'PERSONAL_CARE',
  'MEDICATION_OBSERVATION',
  'MOBILITY',
  'MEALS_HYDRATION',
  'BEHAVIOR_MOOD',
  'PATIENT_CONCERN',
  'CHANGE_IN_CONDITION',
  'TRANSPORTATION',
  'GENERAL_NOTE'
);

CREATE TYPE "CareNoteStatus" AS ENUM ('DRAFT', 'SUBMITTED');

CREATE TYPE "PatientAlertType" AS ENUM (
  'CHANGE_IN_CONDITION',
  'MISSED_VISIT',
  'CAREGIVER_CONCERN',
  'PATIENT_COMPLAINT',
  'FOLLOW_UP_REQUIRED',
  'CARE_INSTRUCTION_UPDATE'
);

CREATE TYPE "PatientAlertPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TYPE "PatientAlertStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TYPE "MessageThreadKind" AS ENUM ('PATIENT', 'STAFF', 'GENERAL');

CREATE TYPE "MessageUrgency" AS ENUM ('NORMAL', 'URGENT');

CREATE TABLE "Patient" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "lastName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "serviceType" "PatientServiceType" NOT NULL,
  "startOfCareDate" TIMESTAMP(3),
  "status" "PatientStatus" NOT NULL DEFAULT 'PENDING',
  "coordinatorUserId" TEXT,
  "internalOfficeNotes" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Patient_publicId_key" ON "Patient"("publicId");
CREATE INDEX "Patient_status_lastName_firstName_idx" ON "Patient"("status", "lastName", "firstName");
CREATE INDEX "Patient_serviceType_status_idx" ON "Patient"("serviceType", "status");
CREATE INDEX "Patient_coordinatorUserId_idx" ON "Patient"("coordinatorUserId");

CREATE TABLE "PatientEmergencyContact" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientEmergencyContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientEmergencyContact_patientId_idx" ON "PatientEmergencyContact"("patientId");

CREATE TABLE "PatientCareInstruction" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "careInstructions" TEXT,
  "mobilityRequirements" TEXT,
  "dietaryRestrictions" TEXT,
  "allergies" TEXT,
  "medicalConditions" TEXT,
  "specialPrecautions" TEXT,
  "additionalInstructions" TEXT,
  "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "supersededAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientCareInstruction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientCareInstruction_patientId_effectiveAt_idx" ON "PatientCareInstruction"("patientId", "effectiveAt");

CREATE TABLE "PatientAssignment" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "serviceType" "PatientServiceType" NOT NULL,
  "status" "PatientAssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "supervisorUserId" TEXT,
  "instructions" TEXT,
  "endedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientAssignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientAssignment_patientId_status_idx" ON "PatientAssignment"("patientId", "status");
CREATE INDEX "PatientAssignment_profileId_status_idx" ON "PatientAssignment"("profileId", "status");
CREATE INDEX "PatientAssignment_startDate_endDate_idx" ON "PatientAssignment"("startDate", "endDate");

CREATE TABLE "PatientVisit" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "assignmentId" TEXT,
  "shiftId" TEXT,
  "primaryProfileId" TEXT,
  "supervisorUserId" TEXT,
  "scheduledStart" TIMESTAMP(3) NOT NULL,
  "scheduledEnd" TIMESTAMP(3) NOT NULL,
  "status" "PatientVisitStatus" NOT NULL DEFAULT 'SCHEDULED',
  "visitNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientVisit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatientVisit_shiftId_key" ON "PatientVisit"("shiftId");
CREATE INDEX "PatientVisit_patientId_scheduledStart_idx" ON "PatientVisit"("patientId", "scheduledStart");
CREATE INDEX "PatientVisit_status_scheduledStart_idx" ON "PatientVisit"("status", "scheduledStart");
CREATE INDEX "PatientVisit_primaryProfileId_idx" ON "PatientVisit"("primaryProfileId");

ALTER TABLE "Shift" ADD COLUMN "patientId" TEXT;
CREATE INDEX "Shift_patientId_idx" ON "Shift"("patientId");

CREATE TABLE "PatientCareNote" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "visitId" TEXT,
  "visitDate" TIMESTAMP(3) NOT NULL,
  "visitTimeMinutes" INTEGER,
  "category" "CareNoteCategory" NOT NULL,
  "careActivities" TEXT,
  "observations" TEXT,
  "concerns" TEXT,
  "actionsTaken" TEXT,
  "additionalComments" TEXT,
  "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
  "status" "CareNoteStatus" NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "reviewerUserId" TEXT,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientCareNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientCareNote_patientId_visitDate_idx" ON "PatientCareNote"("patientId", "visitDate");
CREATE INDEX "PatientCareNote_profileId_status_idx" ON "PatientCareNote"("profileId", "status");
CREATE INDEX "PatientCareNote_status_submittedAt_idx" ON "PatientCareNote"("status", "submittedAt");
CREATE INDEX "PatientCareNote_category_idx" ON "PatientCareNote"("category");

CREATE TABLE "PatientCareNoteAddendum" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientCareNoteAddendum_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientCareNoteAddendum_noteId_createdAt_idx" ON "PatientCareNoteAddendum"("noteId", "createdAt");

CREATE TABLE "PatientAlert" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "reporterUserId" TEXT,
  "reporterProfileId" TEXT,
  "type" "PatientAlertType" NOT NULL,
  "priority" "PatientAlertPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "PatientAlertStatus" NOT NULL DEFAULT 'NEW',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "assigneeUserId" TEXT,
  "resolutionNotes" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientAlert_patientId_status_idx" ON "PatientAlert"("patientId", "status");
CREATE INDEX "PatientAlert_status_priority_idx" ON "PatientAlert"("status", "priority");
CREATE INDEX "PatientAlert_assigneeUserId_idx" ON "PatientAlert"("assigneeUserId");

CREATE TABLE "PatientAlertEvent" (
  "id" TEXT NOT NULL,
  "alertId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "fromStatus" "PatientAlertStatus",
  "toStatus" "PatientAlertStatus",
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientAlertEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientAlertEvent_alertId_createdAt_idx" ON "PatientAlertEvent"("alertId", "createdAt");

CREATE TABLE "MessageThread" (
  "id" TEXT NOT NULL,
  "kind" "MessageThreadKind" NOT NULL,
  "subject" TEXT NOT NULL,
  "patientId" TEXT,
  "urgency" "MessageUrgency" NOT NULL DEFAULT 'NORMAL',
  "officeAckAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MessageThread_kind_archivedAt_idx" ON "MessageThread"("kind", "archivedAt");
CREATE INDEX "MessageThread_patientId_idx" ON "MessageThread"("patientId");
CREATE INDEX "MessageThread_urgency_officeAckAt_idx" ON "MessageThread"("urgency", "officeAckAt");

CREATE TABLE "MessageThreadParticipant" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "MessageThreadParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MessageThreadParticipant_threadId_userId_key" ON "MessageThreadParticipant"("threadId", "userId");
CREATE INDEX "MessageThreadParticipant_userId_idx" ON "MessageThreadParticipant"("userId");

CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "urgency" "MessageUrgency" NOT NULL DEFAULT 'NORMAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

CREATE TABLE "MessageReadReceipt" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MessageReadReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MessageReadReceipt_messageId_userId_key" ON "MessageReadReceipt"("messageId", "userId");
CREATE INDEX "MessageReadReceipt_userId_idx" ON "MessageReadReceipt"("userId");

CREATE TABLE "PatientAuditEvent" (
  "id" TEXT NOT NULL,
  "patientId" TEXT,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "meta" JSONB,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientAuditEvent_patientId_createdAt_idx" ON "PatientAuditEvent"("patientId", "createdAt");
CREATE INDEX "PatientAuditEvent_entityType_entityId_idx" ON "PatientAuditEvent"("entityType", "entityId");
CREATE INDEX "PatientAuditEvent_createdAt_idx" ON "PatientAuditEvent"("createdAt");

ALTER TABLE "Patient" ADD CONSTRAINT "Patient_coordinatorUserId_fkey" FOREIGN KEY ("coordinatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientEmergencyContact" ADD CONSTRAINT "PatientEmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientCareInstruction" ADD CONSTRAINT "PatientCareInstruction_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientAssignment" ADD CONSTRAINT "PatientAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientAssignment" ADD CONSTRAINT "PatientAssignment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientAssignment" ADD CONSTRAINT "PatientAssignment_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "PatientAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_primaryProfileId_fkey" FOREIGN KEY ("primaryProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Shift" ADD CONSTRAINT "Shift_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientCareNote" ADD CONSTRAINT "PatientCareNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientCareNote" ADD CONSTRAINT "PatientCareNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientCareNote" ADD CONSTRAINT "PatientCareNote_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "PatientVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientCareNote" ADD CONSTRAINT "PatientCareNote_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientCareNoteAddendum" ADD CONSTRAINT "PatientCareNoteAddendum_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "PatientCareNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientCareNoteAddendum" ADD CONSTRAINT "PatientCareNoteAddendum_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_reporterProfileId_fkey" FOREIGN KEY ("reporterProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientAlertEvent" ADD CONSTRAINT "PatientAlertEvent_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "PatientAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageThreadParticipant" ADD CONSTRAINT "MessageThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageThreadParticipant" ADD CONSTRAINT "MessageThreadParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MessageReadReceipt" ADD CONSTRAINT "MessageReadReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReadReceipt" ADD CONSTRAINT "MessageReadReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientAuditEvent" ADD CONSTRAINT "PatientAuditEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PatientAuditEvent" ADD CONSTRAINT "PatientAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;