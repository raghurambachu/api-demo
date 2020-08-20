const { Schema, model } = require("mongoose");

const questionSchema = new Schema(
  {
    tags: [String],
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [],
  },
  { timestamps: true }
);

module.exports = model("Question", questionSchema);
