import type {
  CareNoteCategory,
  PatientAlertType,
  PatientServiceType,
  PatientStatus,
} from "@/generated/prisma";

export const patientServiceLabels: Record<PatientServiceType, string> = {
  SKILLED_NURSING: "Skilled Nursing",
  HOSPICE: "Hospice",
  PRIVATE_DUTY: "Private Duty",
  PATIENT_TRANSPORTATION: "Patient Transportation",
};

export const patientStatusLabels: Record<PatientStatus, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  ON_HOLD: "On Hold",
  DISCHARGED: "Discharged",
  INACTIVE: "Inactive",
};

export const careNoteCategoryLabels: Record<CareNoteCategory, string> = {
  DAILY_CARE: "Daily Care",
  PERSONAL_CARE: "Personal Care",
  MEDICATION_OBSERVATION: "Medication Observation",
  MOBILITY: "Mobility",
  MEALS_HYDRATION: "Meals and Hydration",
  BEHAVIOR_MOOD: "Behavior or Mood",
  PATIENT_CONCERN: "Patient Concern",
  CHANGE_IN_CONDITION: "Change in Condition",
  TRANSPORTATION: "Transportation",
  GENERAL_NOTE: "General Note",
};

export const patientAlertTypeLabels: Record<PatientAlertType, string> = {
  CHANGE_IN_CONDITION: "Change in condition",
  MISSED_VISIT: "Missed visit",
  CAREGIVER_CONCERN: "Caregiver concern",
  PATIENT_COMPLAINT: "Patient complaint",
  FOLLOW_UP_REQUIRED: "Follow-up required",
  CARE_INSTRUCTION_UPDATE: "Care instruction update",
};