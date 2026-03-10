import { Check, X } from "lucide-react";

const calculateStrength = (password) => {
  let score = 0;
  if (!password) return score;

  if (password.length > 5) score += 1;
  if (password.length > 7) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 5);
};

const getStrengthDetails = (score) => {
  if (score === 0) return { label: "Enter password", color: "bg-muted text-muted-foreground" };
  if (score <= 2) return { label: "Weak", color: "bg-rose-500 text-rose-500" };
  if (score <= 4) return { label: "Fair", color: "bg-amber-500 text-amber-500" };
  return { label: "Strong", color: "bg-emerald-500 text-emerald-500" };
};

export default function PasswordStrength({ password }) {
  const score = calculateStrength(password);
  const details = getStrengthDetails(score);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              score >= level ? details.color.split(" ")[0] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${details.color.split(" ")[1]}`}>
          {password ? details.label : ""}
        </span>
        <span className="text-muted-foreground">
          {score >= 3 ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <Check className="h-3 w-3" /> Minimum requirements met
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-500">
              <X className="h-3 w-3" /> Need more complexity
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
