const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    bio: {
      type: String,
      default: "Tell me something about yourself",
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "user",
      required: true,
      enum: ["user", "admin"],
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

userSchema.methods.toUserJSON = function (token) {
  return {
    user: {
      token,
      email: this.email,
      username: this.username,
    },
  };
};

userSchema.methods.toProfileJSON = function () {
  const user = this;
  return {
    profile: {
      name: user.name || user.username,
      username: user.username,
      image: user.image || "http://via.placeholder.com/640x360",
      bio: user.bio,
    },
  };
};

module.exports = model("User", userSchema);
