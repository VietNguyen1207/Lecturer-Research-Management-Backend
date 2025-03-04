// src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      enum: [Admin, Office, Lecturer, AccountingDepartment, Student],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    status: {
      type: String,
      enum: [Active, Inactive, Suspended],
      default: Active,
    },
    level: String,
    groups: [
      {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        role: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Password verification method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // Add statics for enum access
// userSchema.statics.UserStatus = UserStatus;
// userSchema.statics.UserRole = UserRole;

// // Add indexes
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });

module.exports = mongoose.model("User", userSchema);
