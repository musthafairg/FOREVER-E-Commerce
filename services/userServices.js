import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const createUser = async ({ name, email, mobile, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = new User({ name, email, mobile, password });
  return await user.save();
};

export const validateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return user;
};
