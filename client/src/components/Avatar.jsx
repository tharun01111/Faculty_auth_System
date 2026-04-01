/**
 * Avatar — shows user initials with a deterministic vibrant background color.
 * Falls back gracefully if no name is provided.
 *
 * Props:
 *   name   {string} — user's full name
 *   size   {"sm"|"md"|"lg"|"xl"} — controls dimensions (default "md")
 *   className {string} — extra classes
 */

const PALETTE = [
  "bg-violet-500 text-white",
  "bg-indigo-500 text-white",
  "bg-sky-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-pink-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
  "bg-cyan-500 text-white",
];

function hashName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES = {
  xs:  "h-6 w-6 text-[10px]",
  sm:  "h-8 w-8 text-xs",
  md:  "h-10 w-10 text-sm",
  lg:  "h-14 w-14 text-xl",
  xl:  "h-20 w-20 text-3xl",
};

export default function Avatar({ name = "", size = "md", className = "" }) {
  const initials = getInitials(name);
  const color = PALETTE[hashName(name) % PALETTE.length];
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none ${color} ${sizeClass} ${className}`}
      aria-label={name || "User avatar"}
    >
      {initials}
    </span>
  );
}
