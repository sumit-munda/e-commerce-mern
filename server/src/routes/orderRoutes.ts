import { Router } from "express";
import {
  getUserOrders,
  postOrder,
  getAllOrders,
  getSingleOrder,
  processOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/user", getUserOrders);
router.get("/all", adminOnly, getAllOrders);
router.post("/", postOrder);

router.route("/:id").get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);

export default router;
