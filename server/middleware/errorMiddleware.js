export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // ── Structured console log so you know exactly where the error came from ──
  console.error(
    `[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ` +
    `Status: ${statusCode} | Type: ${err.name || "Error"} | Message: ${err.message}`
  );

  // Log stack in development only
  if (process.env.NODE_ENV !== "production" && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message,
    // errorType helps the developer pinpoint the source (e.g. CastError → bad MongoDB _id)
    ...(process.env.NODE_ENV !== "production" && {
      errorType: err.name,
      stack: err.stack,
    }),
  });
};

// 404 handler — call this BEFORE errorHandler in server.js for unmatched routes
export const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(err);
};
