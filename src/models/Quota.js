const mongoose = require("mongoose");

const quotaSchema = new mongoose.Schema({
  quotaAmount: Number,
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  allocatedAt: { type: Date, default: Date.now },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  limitValue: Number,
  currentValue: Number,
});

module.exports = mongoose.model("Quota", quotaSchema);
