import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes safely.
 * @param inputs - Array of class values, objects, or arrays.
 * @returns A string of merged class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
