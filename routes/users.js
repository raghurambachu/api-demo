var express = require("express");
const User = require("../models/User");
var router = express.Router();

const { generateSaltAndHash, verifyPassword } = require("../utils/index");
const { generateToken, verifyToken } = require("../middlewares/auth");

/* Register User */
router.post("/register", async function (req, res, next) {
  const { email, username, password } = req.body.user;
  // Check if username, email & password exists.
  if (!email || !username || !password) {
    return res.json({
      error: "Username, password & Email are required fields",
    });
  }
  // Check if user already exists;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        error:
          "Email is already registered. Login to access the forum-discussion",
      });
    }
    // Create User if not exists
    const { salt, hash } = await generateSaltAndHash(password, next);

    let registerUser = new User({
      email,
      username,
      salt,
      hash,
      role: "user",
    });
    registerUser = await registerUser.save();
    const payload = {
      sub: registerUser._id,
      username,
      email,
    };
    const token = await generateToken(payload, next);
    return res.status(201).json(registerUser.toUserJSON(token));
  } catch (err) {
    next(err);
  }
});

// Login User
router.post("/login", async function (req, res, next) {
  const { email, password } = req.body.user;
  if (!email || !password) {
    return res.status(400).json({
      error: "Password & Email are required fields",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error:
          "Email is not registered. Please register to access the community-forum",
      });
    }
    // validate the password
    const isValid = await verifyPassword(password, user.hash, next);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid Credentials." });
    }
    // If password was valid, login successful, so generate a token
    const payload = {
      sub: user._id,
      username: user.username,
      email,
    };
    const token = await generateToken(payload, next);
    return res.json(user.toUserJSON(token));
  } catch (err) {
    next(err);
  }
});

router.get("/current-user", verifyToken, async function (req, res, next) {
  const user = req.user;
  return res.json({
    user: {
      token: user.token,
      email: user.email,
      username: user.username,
    },
  });
});

module.exports = router;
