import { users } from "../models/userModel.js";
import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "./errorMiddleware.js";

export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("Please login first", 400));

  const user = await users.findById(id);
  if (!user) return next(new ErrorHandler("Invalid Id", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("Sorry! Admin ONLY", 403));
  next();
});
