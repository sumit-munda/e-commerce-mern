import { Router } from "express";
import {
  getUser,
  getAllUsers,
  postUser,
  deleteUser,
} from "../controllers/userController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", adminOnly, getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.delete("/:id", adminOnly, deleteUser);

// * or
// router.route("/").get(getAllUsers).post(postUser);
// router.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default router;
