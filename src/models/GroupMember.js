const mongoose = require("mongoose");

// Define proper enums
const MemberRole = {
  LEADER: "Leader",
  MEMBER: "Member",
  CHAIRMAN: "Chairman",
  SECRETARY: "Secretary",
};

const MemberStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
};

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // referncing userID to get user information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(MemberStatus),
      default: MemberStatus.PENDING,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
groupMemberSchema.statics.MemberRole = MemberRole;
groupMemberSchema.statics.MemberStatus = MemberStatus;

// Add indexes
groupMemberSchema.index({ groupId: 1 });
groupMemberSchema.index({ userId: 1 });
groupMemberSchema.index({ status: 1 });

// Ensure a user can only be in one group
groupMemberSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("GroupMember", groupMemberSchema);
