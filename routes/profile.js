const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");
const { findOneAndUpdate, update } = require("../models/User");

// Get Profile information
router.get("/:username", async function (req, res, next) {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .send({ error: `Profile of ${username} not found.` });
    }
    res.json(user.toProfileJSON());
  } catch (err) {
    next(err);
  }
});

// Update Profile information
router.put("/:username", verifyToken, async function (req, res, next) {
  const username = req.params.username;
  const infoToUpdate = req.body.user;
  // Check if person who is logged in, is the one who is trying to updated the information
  if (username !== req.user.username) {
    return res.status(401).json({
      error: "Unauthorised access, only you can can update your profile.",
    });
  }
  //Check if email or username is being updated. If they are being updated ensure that they don't exist in db.
  const { email, usernameInBody } = req.body.user;
  if (email) {
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "Email is already registered" });
      }
    } catch (err) {
      next(err);
    }
  }
  if (usernameInBody) {
    try {
      const user = await User.findOne({ username: usernameInBody });
      if (user) {
        return res
          .status(400)
          .json({ error: "Username is already registered" });
      }
    } catch (err) {
      next(err);
    }
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username },
      infoToUpdate,
      {
        new: true,
      }
    );
    res.status(201).json(updatedUser.toProfileJSON());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
