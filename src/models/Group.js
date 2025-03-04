const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    maxMember: {
      type: Number,
      min: 1,
    },
    currentMember: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      enum: [Active, Inactive, Expired],
      default: Active,
    },
    groupType: {
      type: String,
      enum: [Research, Council],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);
