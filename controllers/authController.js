import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
//registerconstoller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    console.log("Request body:", req.body);

    // Validations
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!answer) {
      return res.status(400).json({ message: "Address is required" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered, please login",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("Hashed password:", hashedPassword);

    // Initialize and save user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    });

    console.log("User before saving:", user);

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in registration",
    });
  }
};
//logincontroller
export const logincontroller = async (req, res) => {
  try {
    const { email, password } = req.body;
    //VALIDATION
    if (!email || !password) {
      return res.status(404).send({
        message: "Invalid email or password",
      });
    }
    //CHECK USER
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: "email is not registerd" });
    }
    //
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid password" });
    }
    //TOKEN
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in loging",
      error,
    });
  }
};
// forgotpasswordcontroller

export const forgetPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      return res.status(400).send({ message: "New password is required" });
    }

    // Check if user exists with the provided email and answer
    const user = await userModel.findOne({ email, answer });

    // Validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or answer",
      });
    }

    // Hash the new password
    const hashed = await hashPassword(newPassword);

    // Update the user's password
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const testcontroller = (req, res) => {
  res.send("hello protected route");
};
//UPDATE PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is require and  6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
      updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while updating user profile",
      error,
    });
  }
};
