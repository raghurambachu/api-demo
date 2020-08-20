const express = require("express");
const slugify = require("slugify");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

async function toQuestionsJSON(_id) {
  const question = await Question.findOne({ _id })
    .populate("author", "_id username")
    .exec();

  const answers = await Answer.find({ question: _id })
    .populate("author", "_id username")
    .exec();
  return {
    question: {
      tags: question.tags,
      _id: question._id,
      answers,
      title: question.title,
      description: question.description,
      author: question.author,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      slug: question.slug,
      __v: question.__v,
    },
  };
}

router.post("/", verifyToken, async function (req, res, next) {
  const question = req.body.question;
  if (!question.title) {
    return res.status(400).json({ error: "Title is required field." });
  }
  const slug = slugify(question.title, { lower: true });
  try {
    const checkQuestion = await Question.findOne({ slug });
    if (checkQuestion) {
      return res.status(400).json({
        error:
          "Duplicate title error, title cannot be same, choose a different title",
      });
    }
    question.author = req.user.sub;
    question.slug = slug;
    const createQuestion = await Question.create(question);
    const questionJson = await toQuestionsJSON(createQuestion._id);
    res.json(questionJson);
  } catch (err) {
    next(err);
  }
});

// List all questions
router.get("/", async function (req, res, next) {
  try {
    let questions = await Question.find({}, "_id");
    for (let i = 0; i < questions.length; i++) {
      questions[i] = await toQuestionsJSON(questions[i]._id).then(
        (question) => question.question
      );
    }
    if (!questions.length) {
      res.status(404).json({ error: "No questions yet." });
    } else {
      res.json(questions);
    }
  } catch (err) {
    next(err);
  }
});

// Update question
router.put("/:questionId", verifyToken, async function (req, res, next) {
  const questionId = req.params.questionId;
  const question = await Question.findById(questionId);

  if (!question) {
    return res.status(404).json({ error: "There exists no such question." });
  }
  // If there exists question check whether loggedin user is same as the question author.
  const authorId = question.author;
  if (authorId.toString() === req.user.sub.toString()) {
    //   if title is being updated check if updation may lead to conflict
    try {
      const { title } = req.body.question;
      if (title) {
        const slug = slugify(title, { lower: true });
        const questionWithSameSlug = await Question.findOne({ slug });
        if (questionWithSameSlug) {
          return res.status(400).json({
            error:
              "There exists the question with same title, please change the title.",
          });
        }
        req.body.question.slug = slug;
      }

      //   If all fine then need to update it.
      const question = await Question.findOneAndUpdate(
        { _id: questionId },
        req.body.question,
        { new: true }
      );
      const questionJSON = await toQuestionsJSON(question._id);
      res.json(questionJSON);
    } catch (err) {
      next(err);
    }
  } else {
    return res.status(401).json({
      error:
        "Unauthorised access. Only the creator of the question or admin can update the question.",
    });
  }
});

// Delete Question
router.delete("/:slug", verifyToken, async function (req, res, next) {
  const slug = req.params.slug;
  // Check if slug exists. If exists thereafter check delete is requested by the author himself.
  try {
    const question = await Question.findOne({ slug });
    if (!question) {
      return res.status(404).json({ error: "There exists no such question." });
    }
    // Now check whether author is loggedin user
    if (question.author.toString() === req.user.sub.toString()) {
      const deleteQuestion = await Question.findOneAndDelete({ slug });
      res.json({ msg: `successfully deleted Question with title ${slug}` });
    } else {
      res.status(401).json({
        error: "Unauthorised Access. Only author of the question can delete.",
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:questionId/answers", verifyToken, async function (
  req,
  res,
  next
) {
  try {
    // Check if questionId is valid
    const questionId = req.params.questionId;
    const text = req.body.answer.text;
    const answer = req.body.answer;
    if (!text) {
      return res.status(400).json({ error: "Text answer is required field." });
    }
    const question = await Question.findOne({ _id: questionId });
    if (!question) {
      return res.status(400).json({ error: "There exists no such question." });
    }
    answer.author = req.user.sub;
    answer.question = questionId;

    const createAnswer = await Answer.create(answer);
    const answerJSON = await createAnswer.toAnswerJSON(next);
    res.status(201).json(answerJSON);
  } catch (err) {
    next(err);
  }
});

// List Answers
router.get("/:questionId/answers", verifyToken, async function (
  req,
  res,
  next
) {
  try {
    const questionId = req.params.questionId;
    // check if question exists.
    const question = await Question.findOne({ _id: questionId });
    if (!question) {
      return res.status(400).json({ error: "There exists no such question" });
    }
    // If question exists then can proceed for finding the answers
    const answers = await Answer.find({ question: questionId });
    if (!answers.length) {
      return res.json({ msg: "No answers for this question exists yet" });
    }
    for (let i = 0; i < answers.length; i++) {
      answers[i] = await answers[i]
        .toAnswerJSON()
        .then((answer) => answer.answer);
    }
    res.json({ answers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
