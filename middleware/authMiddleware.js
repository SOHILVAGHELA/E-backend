import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// PROTECTED ROUTES TOKEN BASE
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "Authorization token is required" });
    }
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode; // Attach the decoded user information to the request object
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      res.status(401).send({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).send({ error: "Invalid token" });
    } else {
      res.status(401).send({ error: "Unauthorized" });
    }
  }
};
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      // Check if the user role is not equal to 1 (admin)
      return res.status(403).send({
        success: false,
        message: "Unauthorized access",
      });
    }
    next(); // If the user is an admin, proceed to the next middleware/route handler
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in admin middleware",
    });
  }
};
