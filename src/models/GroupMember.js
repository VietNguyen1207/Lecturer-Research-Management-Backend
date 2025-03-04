const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    memberEmail: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    role: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [Leader, Member, Chairman, Secretary],
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
groupMemberSchema.statics.MemberStatus = MemberStatus;

// Add indexes for frequently queried fields
groupMemberSchema.index({ groupId: 1 });
groupMemberSchema.index({ userId: 1 });
groupMemberSchema.index({ status: 1 });
groupMemberSchema.index({ memberEmail: 1 });

module.exports = mongoose.model("GroupMember", groupMemberSchema);
