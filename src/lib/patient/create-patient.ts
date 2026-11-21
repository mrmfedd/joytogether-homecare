import type { PatientServiceType, PatientStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { encryptPhi } from "@/lib/patient/phi-crypto";
import { formatPatientPublicId } from "@/lib/patient/public-id";

export type CreatePatientInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  serviceType: PatientServiceType;
  startOfCareDate?: Date;
  status: PatientStatus;
  coordinatorUserId?: string;
  internalOfficeNotes?: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  careInstructions?: string;
  mobilityRequirements?: string;
  dietaryRestrictions?: string;
  allergies?: string;
  medicalConditions?: string;
  specialPrecautions?: string;
  additionalInstructions?: string;
  createdByUserId: string;
};

export async function createPatientRecord(input: CreatePatientInput) {
  const year = new Date().getFullYear();
  const count = await prisma.patient.count({
    where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`) } },
  });
  const publicId = formatPatientPublicId(count + 1, year);

  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.create({
      data: {
        publicId,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        phone: input.phone,
        email: input.email,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        serviceType: input.serviceType,
        startOfCareDate: input.startOfCareDate,
        status: input.status,
        coordinatorUserId: input.coordinatorUserId,
        internalOfficeNotes: encryptPhi(input.internalOfficeNotes),
        createdByUserId: input.createdByUserId,
      },
    });

    await tx.patientEmergencyContact.create({
      data: {
        patientId: patient.id,
        name: input.emergencyName,
        phone: input.emergencyPhone,
        relationship: input.emergencyRelationship,
        isPrimary: true,
      },
    });

    const hasCare =
      input.careInstructions ||
      input.mobilityRequirements ||
      input.dietaryRestrictions ||
      input.allergies ||
      input.medicalConditions ||
      input.specialPrecautions ||
      input.additionalInstructions;

    if (hasCare) {
      await tx.patientCareInstruction.create({
        data: {
          patientId: patient.id,
          careInstructions: encryptPhi(input.careInstructions),
          mobilityRequirements: encryptPhi(input.mobilityRequirements),
          dietaryRestrictions: encryptPhi(input.dietaryRestrictions),
          allergies: encryptPhi(input.allergies),
          medicalConditions: encryptPhi(input.medicalConditions),
          specialPrecautions: encryptPhi(input.specialPrecautions),
          additionalInstructions: encryptPhi(input.additionalInstructions),
        },
      });
    }

    return patient;
  });
}