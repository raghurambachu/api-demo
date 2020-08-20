const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const router = express.Router();

// Update Answer
router.put("/:answerId", verifyToken, async function (req, res, next) {
  try {
    const answerId = req.params.answerId;
    // check if such answer exists.
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(400).json({ error: "No such answer exists" });
    }
    // Now if answer exists need to verify whether the logged in user the author of the answer.
    if (answer.author.toString() === req.user.sub.toString()) {
      const text = req.body.answer.text;
      if (!text) {
        return res.json({ error: "Answer text is the required field" });
      } else {
        const updateAnswer = await Answer.findByIdAndUpdate(
          answerId,
          { text },
          { new: true }
        );
        const answerJSON = await updateAnswer.toAnswerJSON(next);
        res.status(201).json(answerJSON);
      }
    } else {
      return res.status(401).json({
        error:
          "Unauthorised Access, only author of the answer can update the answer",
      });
    }
  } catch (err) {
    next(err);
  }
});

// Delete Answer
router.delete("/:answerId", verifyToken, async function (req, res, next) {
  try {
    const answerId = req.params.answerId;
    // check if answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(400).json({ error: "No such answer exists" });
    }
    const questionId = answer.question;
    // Now check if loggedin user is the author
    if (req.user.sub.toString() === answer.author.toString()) {
      // if loggedin user is author , then delete from Answer & Question
      const deleteAnswer = await Answer.findByIdAndDelete(answerId);
      console.log(deleteAnswer);
      const updateQuestion = await Question.findByIdAndUpdate(questionId, {
        $pull: { answers: answer._id },
      });
      const answerJSON = await answer.toAnswerJSON(next);
      return res.json(answerJSON);
    } else {
      return res.json({
        error: "Unauthorised access. Only the author can delete the answer.",
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
