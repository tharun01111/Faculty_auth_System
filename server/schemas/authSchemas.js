import { z } from "zod";

// ── Shared field definitions ────────────────────────────────────────────────
const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .email("Must be a valid email address")
  .toLowerCase();

const passwordField = z
  .string({ required_error: "Password is required" })
  .min(6, "Password must be at least 6 characters");

const nameField = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long");

// ── Auth schemas ────────────────────────────────────────────────────────────

/** POST /faculty/login  |  POST /admin/login */
export const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

/** POST /admin/register */
export const adminRegisterSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

/** POST /faculty/register (admin-only) */
export const facultyRegisterSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

/** POST /faculty/forgot-password */
export const forgotPasswordSchema = z.object({
  email: emailField,
});

/** POST /faculty/reset-password/:token */
export const resetPasswordSchema = z.object({
  password: passwordField,
});

/** PATCH /faculty/change-password */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: passwordField,
});

/** POST /admin/faculty/bulk-register  { faculty: [{name, email, password}] } */
export const bulkRegisterSchema = z.object({
  faculty: z
    .array(
      z.object({
        name: nameField,
        email: emailField,
        password: passwordField,
      })
    )
    .min(1, "At least one faculty row is required")
    .max(200, "Cannot import more than 200 rows at once"),
});

