import { FIELD_CLASS } from "@/lib/ui/styles";

type MentorAccountFieldsProps = {
  namePrefix?: string;
  mentorName?: string;
  required?: boolean;
};

function fieldName(prefix: string, key: string) {
  return prefix ? `${prefix}_${key}` : key;
}

export function MentorAccountFields({
  namePrefix = "",
  mentorName,
  required = false,
}: MentorAccountFieldsProps) {
  const emailId = fieldName(namePrefix, "mentor-account-email");
  const nameId = fieldName(namePrefix, "mentor-account-name");
  const passwordId = fieldName(namePrefix, "mentor-account-password");

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Email
        </label>
        <input
          id={emailId}
          name={fieldName(namePrefix, "email")}
          type="email"
          required={required}
          autoComplete="off"
          className={FIELD_CLASS}
          placeholder="mentor@example.com"
        />
      </div>
      <div>
        <label htmlFor={nameId} className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Display name
        </label>
        <input
          id={nameId}
          name={fieldName(namePrefix, "full_name")}
          type="text"
          className={FIELD_CLASS}
          placeholder={mentorName || "Mentor name"}
        />
      </div>
      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Temporary password
        </label>
        <input
          id={passwordId}
          name={fieldName(namePrefix, "password")}
          type="password"
          required={required}
          minLength={8}
          autoComplete="new-password"
          className={FIELD_CLASS}
          placeholder="At least 8 characters"
        />
        <p className="mt-1 text-xs text-ink-soft">
          Share this password securely. The mentor can change it after signing in.
        </p>
      </div>
    </div>
  );
}
