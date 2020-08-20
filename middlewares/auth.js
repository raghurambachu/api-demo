const jwt = require("jsonwebtoken");

async function generateToken(payload, next) {
  try {
    const token = await jwt.sign(payload, process.env.APP_SECRET);
    return token;
  } catch (err) {
    next(err);
  }
}

async function verifyToken(req, res, next) {
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).json({
      error:
        "Unauthenticated, Please login to access the resource in community-forum",
    });
  }
  try {
    const payload = await jwt.verify(token, process.env.APP_SECRET);
    payload.token = token;
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
