"use client";

import { useId, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";

const whoNeeds = ["My parent", "My spouse", "Myself", "Another loved one"] as const;
const careTypes = [
  "Skilled nursing",
  "Hospice care",
  "Private duty care",
  "Companionship",
  "Personal care",
  "Transportation",
  "Not sure",
] as const;
const timing = [
  "As soon as possible",
  "Within the next few weeks",
  "Planning ahead",
  "Just exploring options",
] as const;

type Step = 1 | 2 | 3 | 4 | "done";

export function CareDiscovery() {
  const formId = useId();
  const [step, setStep] = useState<Step>(1);
  const [who, setWho] = useState<(typeof whoNeeds)[number] | "">("");
  const [care, setCare] = useState<(typeof careTypes)[number] | "">("");
  const [when, setWhen] = useState<(typeof timing)[number] | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    if (step === "done") return 100;
    return ((step as number) / 4) * 100;
  }, [step]);

  async function submit() {
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "care-discovery",
          fullName: name,
          phone,
          email,
          careType: care,
          preferredContact: "phone",
          location: "",
          whoNeedsCare: who,
          timing: when,
          consent,
          message: `Care discovery: who=${who}; care=${care}; timing=${when}`,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit right now.");
      }
      setStep("done");
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <section className="section-pad bg-cream" id="care-discovery">
      <div className="site-container max-w-3xl">
        <div className="text-center">
          <p className="eyebrow-purple">Interactive Care Discovery</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,46px)] text-purple-900">
            Not Sure What Kind of Care You Need?
          </h2>
          <p className="body-muted mx-auto mt-4 max-w-2xl text-sm sm:text-base">
            Answer a few general questions and share how we can reach you. This tool does not provide
            a diagnosis or determine medical eligibility.
          </p>
        </div>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-[var(--joy-green)] transition-all duration-500"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-line bg-white p-6 shadow-sm sm:p-8">
          {step === 1 ? (
            <fieldset>
              <legend className="font-display text-xl text-purple-900">Who needs care?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {whoNeeds.map((option) => (
                  <Choice
                    key={option}
                    name={`${formId}-who`}
                    label={option}
                    checked={who === option}
                    onChange={() => setWho(option)}
                  />
                ))}
              </div>
              <NavRow
                onNext={() => who && setStep(2)}
                nextDisabled={!who}
              />
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset>
              <legend className="font-display text-xl text-purple-900">
                What type of care are you exploring?
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {careTypes.map((option) => (
                  <Choice
                    key={option}
                    name={`${formId}-care`}
                    label={option}
                    checked={care === option}
                    onChange={() => setCare(option)}
                  />
                ))}
              </div>
              <NavRow onBack={() => setStep(1)} onNext={() => care && setStep(3)} nextDisabled={!care} />
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset>
              <legend className="font-display text-xl text-purple-900">When is care needed?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {timing.map((option) => (
                  <Choice
                    key={option}
                    name={`${formId}-when`}
                    label={option}
                    checked={when === option}
                    onChange={() => setWhen(option)}
                  />
                ))}
              </div>
              <NavRow onBack={() => setStep(2)} onNext={() => when && setStep(4)} nextDisabled={!when} />
            </fieldset>
          ) : null}

          {step === 4 ? (
            <div>
              <h3 className="font-display m-0 text-xl text-purple-900">How can we reach you?</h3>
              <p className="body-muted mt-2 text-sm">
                We only collect basic contact details — not medical records, diagnoses, Social
                Security numbers, or insurance identifiers.
              </p>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-bold text-purple-900">
                  Full name
                  <input
                    className="mt-1 w-full rounded-xl border border-line px-3 py-3 font-normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </label>
                <label className="text-sm font-bold text-purple-900">
                  Phone
                  <input
                    className="mt-1 w-full rounded-xl border border-line px-3 py-3 font-normal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    type="tel"
                  />
                </label>
                <label className="text-sm font-bold text-purple-900">
                  Email
                  <input
                    className="mt-1 w-full rounded-xl border border-line px-3 py-3 font-normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    type="email"
                  />
                </label>
                <label className="flex items-start gap-3 text-sm font-medium text-purple-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>I consent to be contacted by JoyTogether Home Care about care options.</span>
                </label>
              </div>
              {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
              <NavRow
                onBack={() => setStep(3)}
                nextLabel={status === "submitting" ? "Sending…" : "Submit inquiry"}
                onNext={() => {
                  if (!name || !phone || !email || !consent) {
                    setError("Please complete all fields and consent to be contacted.");
                    return;
                  }
                  void submit();
                }}
                nextDisabled={status === "submitting"}
              />
            </div>
          ) : null}

          {step === "done" ? (
            <div className="text-center">
              <h3 className="font-display m-0 text-2xl text-purple-900">Thank you</h3>
              <p className="body-muted mt-3">
                Your inquiry was received. A JoyTogether team member will follow up using the
                contact details you provided.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <ButtonLink href="/services/private-duty-care" variant="gold">
                  Explore Private Duty
                </ButtonLink>
                <ButtonLink href="/contact" variant="outlinePurple">
                  Contact page
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Choice({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
        checked
          ? "border-[var(--joy-green)] bg-[var(--sage-light)] text-purple-900"
          : "border-line bg-cream text-purple-800 hover:border-[var(--royal)]"
      }`}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function NavRow({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn btn-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}
