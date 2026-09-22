import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" }
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" }
    });
  }
}

export function isUser(req, res, next) {
  if (req.user?.type !== "user") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "User access only" }
    });
  }
  next();
}

export function isCompany(req, res, next) {
  if (req.user?.type !== "company") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Company access only" }
    });
  }
  next();
}

