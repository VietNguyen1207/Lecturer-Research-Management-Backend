const mongoose = require("mongoose");

// Define enums
const GroupStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
};

const GroupType = {
  RESEARCH: "Research",
  COUNCIL: "Council",
};

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
      default: 10,
    },
    currentMember: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(GroupStatus),
      default: GroupStatus.ACTIVE,
    },
    groupType: {
      type: String,
      enum: Object.values(GroupType),
      required: true,
    },
    // Reference to the supervising lecturer
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
groupSchema.statics.GroupStatus = GroupStatus;
groupSchema.statics.GroupType = GroupType;

// Add indexes
groupSchema.index({ groupName: 1 });
groupSchema.index({ status: 1 });
groupSchema.index({ groupType: 1 });
groupSchema.index({ supervisorId: 1 });

module.exports = mongoose.model("Group", groupSchema);
