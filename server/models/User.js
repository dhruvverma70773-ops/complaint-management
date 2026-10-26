// models/User.js
// Mongoose schema for the User collection

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,          // enforces unique email at DB level
      lowercase: true,
      trim:     true,
    },
    phone: {
      type:    String,
      required:[true, 'Phone number is required'],
      trim:    true,
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: 6,
      select:   false,         // never return password in queries by default
    },
    role: {
      type:    String,
      enum:    ['citizen', 'admin'], // only two allowed roles
      default: 'citizen',
    },
  },
  { timestamps: true }         // adds createdAt and updatedAt automatically
);

// ── Pre-save hook: hash password before storing ──────────────────────────────
// This runs only when the password field is modified (new user or password change)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt    = await bcrypt.genSalt(10); // 10 rounds is the sweet spot
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare a plain-text password with the hashed one ────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
