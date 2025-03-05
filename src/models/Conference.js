const mongoose = require("mongoose");

// Define enum for presentation types
const PresentationType = {
  ORAL: "ORAL",
  POSTER: "POSTER",
  KEYNOTE: "KEYNOTE",
  WORKSHOP: "WORKSHOP",
  PANEL: "PANEL",
  DEMO: "DEMO",
};

// Define enum for conference rankings
const ConferenceRanking = {
  A_STAR: 5, // A* conferences (top-tier)
  A: 4, // A-level conferences
  B: 3, // B-level conferences
  C: 2, // C-level conferences
  OTHER: 1, // Other recognized conferences
};

const conferenceSchema = new mongoose.Schema(
  {
    // Reference to the base project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      // Ensures 1-1 relationship with Project
      unique: true,
    },
    conferenceName: {
      type: String,
      required: true,
      trim: true,
    },
    conferenceRanking: {
      type: Number,
      enum: Object.values(ConferenceRanking),
      default: ConferenceRanking.OTHER,
    },
    location: {
      type: String,
      trim: true,
    },
    presentationDate: Date,
    acceptanceDate: Date,
    conferenceUrl: String,
    presentationType: {
      type: String,
      enum: Object.values(PresentationType),
      default: PresentationType.ORAL,
    },
    conferenceProceedings: String,

    // Additional fields that might be useful -
    //  submissionDate: Date,
    // registrationFee: Number,
    // isInternational: {
    //   type: Boolean,
    //   default: false,
    // },
    // attendees: [
    //   {
    //     userId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "User",
    //     },
    //     name: String,
    //     role: String,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

// Add statics for enum access
conferenceSchema.statics.PresentationType = PresentationType;
conferenceSchema.statics.ConferenceRanking = ConferenceRanking;

// Add indexes
conferenceSchema.index({ projectId: 1 });
conferenceSchema.index({ conferenceName: 1 });
conferenceSchema.index({ conferenceRanking: 1 });
conferenceSchema.index({ presentationDate: 1 });

module.exports = mongoose.model("Conference", conferenceSchema);
