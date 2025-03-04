const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone" },
  documentUrl: String,
  fileName: String,
  documentType: Number,
  uploadAt: { type: Date, default: Date.now },
  uploadBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Document", documentSchema);
