import { ZodError } from "zod";

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 *
 * Usage in a route:
 *   router.post("/login", validate(loginSchema), loginController);
 *
 * On failure: responds with 400 + a readable list of field errors.
 * On success: the schema's parsed (and sanitised) value replaces req.body so
 *             controllers always get trimmed, lowercased, safe data.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Zod v4 uses `err.issues`; v3 used `err.errors` (kept as fallback)
      const issues = err.issues ?? err.errors ?? [];
      const errors = issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      // Log for server visibility
      console.warn(
        `[validateRequest] Validation failed on ${req.method} ${req.originalUrl}: `,
        errors.map((e) => `${e.field}: ${e.message}`).join(" | ")
      );

      return res.status(400).json({
        message: errors[0].message, // primary message (client-friendly)
        errors,                      // full list for debugging
      });
    }
    next(err);
  }
};
