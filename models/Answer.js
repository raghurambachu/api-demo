const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const answerSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

answerSchema.methods.toAnswerJSON = async function (next) {
  try {
    const answer = await Answer.findOne({ _id: this._id })
      .populate("author", "_id username")
      .exec();
    return {
      answer: {
        _id: answer._id,
        text: answer.text,
        author: answer.author,
        questionId: answer.question,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      },
    };
  } catch (err) {
    next(err);
  }
};

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
