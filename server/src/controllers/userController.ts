import { NextFunction, Request, Response } from "express";
import { PostUserRequestBody } from "../types/types.js";
import { users } from "../models/userModel.js";
import { TryCatch } from "../middlewares/errorMiddleware.js";
import ErrorHandler from "../utils/utilityClass.js";

export const postUser = TryCatch(
  async (
    req: Request<{}, {}, PostUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, role, _id, dob } = req.body;
    let user = await users.findById(_id);

    if (user) {
      res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
      });
    }

    if (!_id || !name || !email || !photo || !gender || !dob) {
      next(new ErrorHandler("Please add all fields", 400));
    }

    user = await users.create({
      name,
      email,
      photo,
      gender: gender.toLowerCase(),
      role,
      _id,
      dob,
    });
    res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const allUsers = await users.find({});
  res.status(200).json({
    success: true,
    users: allUsers,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await users.findById(id);

  if (!user) next(new ErrorHandler("Invalid Id", 400));

  res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await users.findById(id);
  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
