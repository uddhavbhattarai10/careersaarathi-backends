const jwt = require("jsonwebtoken");

function decodeJWT(req, res, next) {
  // Get the token from the request cookies
  const token = req.cookies.authToken;

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Missing Token" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded information to the request object for further use
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // Token verification failed
    return res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
}

module.exports = decodeJWT;
