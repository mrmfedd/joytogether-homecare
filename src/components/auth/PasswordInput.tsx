"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  labelClassName?: string;
  wrapperClassName?: string;
};

export function PasswordInput({
  label,
  labelClassName = "block text-sm font-semibold",
  wrapperClassName = "mt-1",
  className = "w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 pr-11 text-[var(--midnight)]",
  id,
  ...inputProps
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <label className={labelClassName} htmlFor={inputId}>
      {label}
      <div className={`relative ${wrapperClassName}`}>
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          className={className}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-[var(--midnight)]/70 hover:bg-black/5 hover:text-[var(--midnight)]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </label>
  );
}