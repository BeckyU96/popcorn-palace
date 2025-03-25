// Utility function to send consistent error responses
function handleError(res, status, message, details = null) {
  return res.status(status).json({ success: false, message, details });
}

module.exports = {
  handleError,
};
