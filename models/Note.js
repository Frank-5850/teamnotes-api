const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { v4: uuidv4 } = reqiore("uuid");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    title: {
      type: String,
      require: true,
    },
    text: {
      type: String,
      require: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_sequence: 100,
});

module.exports = mongoose.model("Note", noteSchema);