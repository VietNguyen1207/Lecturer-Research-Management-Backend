const mongoose = require("mongoose");

// Define enum for invitation status
const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

// Define enum for invitation types
const InvitationType = {
  GROUP_MEMBER: "GROUP_MEMBER",
  GROUP_SUPERVISOR: "GROUP_SUPERVISOR",
  COUNCIL_CHAIRMAN: "COUNCIL_CHAIRMAN",
  COUNCIL_SECRETARY: "COUNCIL_SECRETARY",
  COUNCIL_MEMBER: "COUNCIL_MEMBER",
  PROJECT_AUTHOR: "PROJECT_AUTHOR",
  PROJECT_COLLABORATOR: "PROJECT_COLLABORATOR",
};

const invitationSchema = new mongoose.Schema(
  {
    // Message explaining the invitation
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Group the invitation is for
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      validate: {
        validator: function (v) {
          // Either groupId or projectId must be provided
          return this.groupId || this.projectId;
        },
        message: "Either groupId or projectId must be provided",
      },
    },
    // Project the invitation is for (for author invitations)
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    // User being invited
    inviteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User sending the invitation
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Role being offered
    invitedRole: {
      type: String,
      required: true,
      trim: true,
    },
    // Type of invitation
    invitationType: {
      type: String,
      enum: Object.values(InvitationType),
      required: true,
    },
    // Status of the invitation
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    // When the invitation was responded to
    responseDate: {
      type: Date,
    },
    // Response message (optional)
    responseMessage: {
      type: String,
      trim: true,
    },
    // Expiration date
    expiresAt: {
      type: Date,
      default: function () {
        // Default to 7 days from creation
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      },
    },
    // Additional data specific to the invitation type
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
invitationSchema.statics.InvitationStatus = InvitationStatus;
invitationSchema.statics.InvitationType = InvitationType;

// Add indexes for frequently queried fields
invitationSchema.index({ inviteeId: 1, status: 1 });
invitationSchema.index({ groupId: 1, inviteeId: 1, status: 1 });
invitationSchema.index({ projectId: 1, inviteeId: 1, status: 1 });
invitationSchema.index({ inviterId: 1 });
invitationSchema.index({ expiresAt: 1 });
invitationSchema.index({ status: 1 });

// Compound index to prevent duplicate pending invitations
invitationSchema.index(
  {
    inviteeId: 1,
    groupId: 1,
    invitationType: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: InvitationStatus.PENDING,
      groupId: { $exists: true },
    },
  }
);

invitationSchema.index(
  {
    inviteeId: 1,
    projectId: 1,
    invitationType: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: InvitationStatus.PENDING,
      projectId: { $exists: true },
    },
  }
);

module.exports = mongoose.model("Invitation", invitationSchema);
