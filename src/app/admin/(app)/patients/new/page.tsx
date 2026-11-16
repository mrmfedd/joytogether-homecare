import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatients } from "@/lib/patient/permissions";
import { listOfficeCoordinators } from "@/lib/patient/queries";
import { createPatientAction } from "../actions";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { PhiFieldLabel } from "@/components/patient/PhiFieldLabel";

const fieldClass = "mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-base sm:text-sm";

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManagePatients(user.role)) redirect("/admin/patients");

  const params = await searchParams;
  const coordinators = await listOfficeCoordinators();

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients/new"
        title="Register Patient"
        description="Collect coordination details only. Social Security numbers are not collected. Use demonstration data on non-production environments."
      />

      {params.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <form action={createPatientAction} className="mt-6 space-y-8 rounded-2xl border border-line bg-white p-5 sm:p-8">
        <section>
          <h2 className="font-display text-xl text-[var(--midnight)]">Personal information</h2>
          <button type="button" className="sr-only">
            Patient ID assigned automatically on save
          </button>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input name="firstName" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              Middle name (optional)
              <input name="middleName" className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input name="lastName" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              Date of birth
              <input name="dateOfBirth" type="date" required className={fieldClass} />
            </label>
            <label className="text-sm font-semibold">
              Phone
              <input name="phone" type="tel" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              Email (optional)
              <input name="email" type="email" className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Home address
              <input name="addressLine1" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Address line 2
              <input name="addressLine2" className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              City
              <input name="city" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              State
              <input name="state" required maxLength={2} placeholder="FL" className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              ZIP
              <input name="postalCode" required className={fieldClass} autoComplete="off" />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--midnight)]">Emergency contact</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Name
              <input name="emergencyName" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold">
              Phone
              <input name="emergencyPhone" type="tel" required className={fieldClass} autoComplete="off" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Relationship
              <input name="emergencyRelationship" required className={fieldClass} autoComplete="off" />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--midnight)]">Care information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Type of service
              <select name="serviceType" required className={fieldClass} defaultValue="PRIVATE_DUTY">
                <option value="SKILLED_NURSING">Skilled Nursing</option>
                <option value="HOSPICE">Hospice</option>
                <option value="PRIVATE_DUTY">Private Duty</option>
                <option value="PATIENT_TRANSPORTATION">Patient Transportation</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Start of care date
              <input name="startOfCareDate" type="date" className={fieldClass} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              <PhiFieldLabel>Care instructions</PhiFieldLabel>
              <textarea name="careInstructions" rows={3} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              <PhiFieldLabel>Mobility assistance</PhiFieldLabel>
              <textarea name="mobilityRequirements" rows={2} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold">
              <PhiFieldLabel>Dietary restrictions</PhiFieldLabel>
              <textarea name="dietaryRestrictions" rows={2} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold">
              <PhiFieldLabel>Allergies</PhiFieldLabel>
              <textarea name="allergies" rows={2} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              <PhiFieldLabel>Medical conditions</PhiFieldLabel>
              <textarea name="medicalConditions" rows={2} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              <PhiFieldLabel>Special precautions</PhiFieldLabel>
              <textarea name="specialPrecautions" rows={2} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Additional instructions
              <textarea name="additionalInstructions" rows={2} className={fieldClass} />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--midnight)]">Administrative</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Patient status
              <select name="status" className={fieldClass} defaultValue="PENDING">
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Office coordinator
              <select name="coordinatorUserId" className={fieldClass} defaultValue="">
                <option value="">— Select —</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? c.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              <PhiFieldLabel>Internal office notes</PhiFieldLabel>
              <textarea name="internalOfficeNotes" rows={3} className={fieldClass} />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-purple px-6 py-3 text-base font-semibold">
            Save patient
          </button>
          <Link href="/admin/patients" className="rounded-xl border border-line px-6 py-3 text-sm font-semibold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}