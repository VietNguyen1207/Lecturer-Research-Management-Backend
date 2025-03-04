// src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define proper enums
const UserRole = {
  ADMIN: "Admin",
  OFFICE: "Office",
  LECTURER: "Lecturer",
  ACCOUNTING_DEPARTMENT: "AccountingDepartment",
  STUDENT: "Student",
};

const UserStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: String,
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    level: String,
    // For students and lecturers - single group reference
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    // For tracking role in the group
    groupRole: {
      type: String,
      enum: ["Leader", "Member", "Supervisor"],
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add statics for enum access
userSchema.statics.UserStatus = UserStatus;
userSchema.statics.UserRole = UserRole;

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ groupId: 1 });

module.exports = mongoose.model("User", userSchema);
