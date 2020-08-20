const bcrypt = require("bcrypt");

async function generateSaltAndHash(password, next) {
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  } catch (err) {
    next(err);
  }
}

async function verifyPassword(password, hash, next) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  generateSaltAndHash,
  verifyPassword,
};
