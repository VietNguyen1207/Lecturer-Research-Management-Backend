const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  status: Number,
  assignTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  progressPercentage: { type: Number, default: 0 },
});

module.exports = mongoose.model("Milestone", milestoneSchema);
