/**
 * Creates a custom error object with additional properties.
 * @param {Error|string} error - The original error or error message.
 * @param {number} [statusCode=500] - The HTTP status code for the error.
 * @returns {Error} A custom error object with status and statusCode properties.
 */
exports.createError = (error, statusCode = 500) => {
    const customError = new Error(error instanceof Error ? error.message : error);
    customError.status = statusCode;
    customError.statusCode = statusCode;
    return customError;
  };