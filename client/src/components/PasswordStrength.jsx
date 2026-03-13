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
  if (score === 1) return { label: "Weak", color: "bg-rose-500 text-rose-500" };
  if (score === 2) return { label: "Fair", color: "bg-orange-500 text-orange-500" };
  if (score === 3) return { label: "Good", color: "bg-amber-500 text-amber-500" };
  return { label: "Strong", color: "bg-emerald-500 text-emerald-500" };
};

export default function PasswordStrength({ password }) {
  const score = calculateStrength(password);
  const details = getStrengthDetails(score);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => {
          let segmentColor = "bg-muted";
          if (score >= level) {
             if (level === 1) segmentColor = "bg-rose-500";
             else if (level === 2) segmentColor = "bg-orange-500";
             else if (level === 3) segmentColor = "bg-amber-500";
             else if (level === 4) segmentColor = "bg-emerald-500";
          }
          return (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${segmentColor}`}
            />
          );
        })}
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
