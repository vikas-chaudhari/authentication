import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  dateofbirth: Date,
});

export const userModel = mongoose.model("User", userSchema);
