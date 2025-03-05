const mongoose = require("mongoose");

// Define enum for notification types
const NotificationType = {
  GROUP_INVITATION: "GROUP_INVITATION",
  COUNCIL_INVITATION: "COUNCIL_INVITATION",
  MILESTONE_UPDATE: "MILESTONE_UPDATE",
  TIMELINE_REMINDER: "TIMELINE_REMINDER",
  PROJECT_APPROVAL: "PROJECT_APPROVAL",
  PROJECT_REJECTION: "PROJECT_REJECTION",
  DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD",
  EXPENSE_APPROVAL: "EXPENSE_APPROVAL",
  EXPENSE_REJECTION: "EXPENSE_REJECTION",
  GENERAL_ANNOUNCEMENT: "GENERAL_ANNOUNCEMENT",
};

// Define enum for notification status
const NotificationStatus = {
  UNREAD: "UNREAD",
  READ: "READ",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  ARCHIVED: "ARCHIVED",
};

// Define enum for notification priority
const NotificationPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Title of the notification
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed message
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Type of notification
    notificationType: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    // Status of the notification
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
    },
    // Priority level
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },
    // Optional reference to related project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    // Optional reference to related group
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    // Optional reference to related milestone
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
    },
    // Optional reference to related timeline
    timelineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timeline",
    },
    // Optional reference to related document
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    // Optional reference to related expense
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConferenceExpense",
    },
    // For invitation notifications
    invitation: {
      // ID of the entity sending the invitation
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      // Role being offered (for group/council invitations)
      role: String,
      // Expiration date for the invitation
      expiresAt: Date,
      // Additional data specific to the invitation
      additionalData: mongoose.Schema.Types.Mixed,
    },
    // For action-required notifications
    actionRequired: {
      type: Boolean,
      default: false,
    },
    // URL or route to direct user when clicking the notification
    actionUrl: {
      type: String,
      trim: true,
    },
    // When the notification was read
    readAt: Date,
    // When the notification expires (will be auto-archived)
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
notificationSchema.statics.NotificationType = NotificationType;
notificationSchema.statics.NotificationStatus = NotificationStatus;
notificationSchema.statics.NotificationPriority = NotificationPriority;

// Add indexes for frequently queried fields
notificationSchema.index({ userId: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ notificationType: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ "invitation.expiresAt": 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ projectId: 1 });
notificationSchema.index({ groupId: 1 });

// Method to mark notification as read
// notificationSchema.methods.markAsRead = function () {
//   this.status = NotificationStatus.READ;
//   this.readAt = new Date();
//   return this.save();
// };

// Method to accept invitation
// notificationSchema.methods.acceptInvitation = function () {
//   if (this.notificationType.includes("INVITATION")) {
//     this.status = NotificationStatus.ACCEPTED;
//     return this.save();
//   }
//   throw new Error("This notification is not an invitation");
// };

// Method to decline invitation
// notificationSchema.methods.declineInvitation = function () {
//   if (this.notificationType.includes("INVITATION")) {
//     this.status = NotificationStatus.DECLINED;
//     return this.save();
//   }
//   throw new Error("This notification is not an invitation");
// };

// // Static method to get unread notifications for a user
// notificationSchema.statics.getUnreadForUser = function (userId) {
//   return this.find({
//     userId: userId,
//     status: NotificationStatus.UNREAD,
//   }).sort({ createdAt: -1 });
// };

// Static method to create group invitation notification
// notificationSchema.statics.createGroupInvitation = async function (
//   userId,
//   groupId,
//   senderId,
//   role,
//   message
// ) {
//   const Group = mongoose.model("Group");
//   const group = await Group.findById(groupId);

//   if (!group) {
//     throw new Error("Group not found");
//   }

//   return new this({
//     userId: userId,
//     title: `Invitation to join ${group.groupName}`,
//     message:
//       message || `You have been invited to join ${group.groupName} as ${role}`,
//     notificationType: NotificationType.GROUP_INVITATION,
//     groupId: groupId,
//     actionRequired: true,
//     actionUrl: `/groups/${groupId}/invitations`,
//     invitation: {
//       senderId: senderId,
//       role: role,
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
//       additionalData: { groupType: group.groupType },
//     },
//   });
// };

// Static method to create timeline reminder notification
// notificationSchema.statics.createTimelineReminder = async function (
//   userId,
//   timelineId
// ) {
//   const Timeline = mongoose.model("Timeline");
//   const timeline = await Timeline.findById(timelineId);

//   if (!timeline) {
//     throw new Error("Timeline not found");
//   }

//   return new this({
//     userId: userId,
//     title: `Reminder: ${timeline.title}`,
//     message: `The deadline for ${
//       timeline.title
//     } is approaching. End date: ${timeline.endDate.toDateString()}`,
//     notificationType: NotificationType.TIMELINE_REMINDER,
//     timelineId: timelineId,
//     priority: NotificationPriority.HIGH,
//     actionUrl: `/timelines/${timelineId}`,
//   });
// };

module.exports = mongoose.model("Notification", notificationSchema);
