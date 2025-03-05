const mongoose = require("mongoose");

// Define enum for author roles
const AuthorRole = {
  LEAD_AUTHOR: "LEAD_AUTHOR",
  CORRESPONDING_AUTHOR: "CORRESPONDING_AUTHOR",
  CO_AUTHOR: "CO_AUTHOR",
  CONTRIBUTING_AUTHOR: "CONTRIBUTING_AUTHOR",
};

// Define enum for author status
const AuthorStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
};

const authorSchema = new mongoose.Schema(
  {
    // Reference to the project (Conference or Journal)
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      validate: {
        validator: async function (value) {
          // Ensure the project is of type Conference or Journal
          const Project = mongoose.model("Project");
          const project = await Project.findById(value);
          return (
            project &&
            (project.projectType === "CONFERENCE" ||
              project.projectType === "JOURNAL")
          );
        },
        message:
          "Author can only be associated with Conference or Journal projects",
      },
    },
    // Reference to the user (lecturer)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          // Ensure the user is a lecturer
          const User = mongoose.model("User");
          const user = await User.findById(value);
          return user && user.role === "LECTURER";
        },
        message: "Author must be a user with role LECTURER",
      },
    },
    // Author's role in the project
    authorRole: {
      type: String,
      enum: Object.values(AuthorRole),
      required: true,
    },
    // Author's status
    status: {
      type: String,
      enum: Object.values(AuthorStatus),
      default: AuthorStatus.ACTIVE,
    },
    // Author's contribution percentage
    contributionPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Author's order in the publication
    authorOrder: {
      type: Number,
      min: 1,
      required: true,
    },
    // Optional fields for external authors (if needed)
    isExternalAuthor: {
      type: Boolean,
      default: false,
    },
    externalAuthorDetails: {
      name: String,
      email: String,
      institution: String,
      country: String,
    },
    // Notes about the author's contribution
    contributionNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
authorSchema.statics.AuthorRole = AuthorRole;
authorSchema.statics.AuthorStatus = AuthorStatus;

// Add indexes for frequently queried fields
authorSchema.index({ projectId: 1 });
authorSchema.index({ userId: 1 });
authorSchema.index({ authorRole: 1 });
authorSchema.index({ status: 1 });

// Compound index to ensure a user can only have one role per project
authorSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Author", authorSchema);
