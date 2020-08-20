const express = require("express");
const Question = require("../models/Question");
const router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    const tags = await Question.distinct("tags");
    res.json({
      tags,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
