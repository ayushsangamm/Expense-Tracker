// backend/middleware/errorMiddleware.js
// Standard global error-handling middleware for Express.

const errorHandler = (err, req, res, next) => {
  // Set status code: use the existing error code, or default to 500 (Internal Server Error)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(`\x1b[31m%s\x1b[0m`, `[Error Handler] Triggered: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Handle Mongoose duplicate key errors (e.g. duplicate email registrations)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error: An entry with this value already exists.',
    });
  }

  // Send a clean, unified JSON message response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server encountered an unexpected error',
    // Only output full stack trace details during local development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
