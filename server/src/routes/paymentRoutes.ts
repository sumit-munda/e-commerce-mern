import { Router } from "express"
import { adminOnly } from "../middlewares/authMiddleware.js";
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, getCoupon, newCoupon, updateCoupon } from "../controllers/paymentController.js";

const router = Router();

router.post("/create", createPaymentIntent);
router.get("/discount", applyDiscount);
router.post("/coupons",adminOnly, newCoupon);
router.get("/coupons/all", adminOnly, allCoupons);

router.route("/coupons/:id").get(adminOnly, getCoupon).put(adminOnly, updateCoupon).delete(adminOnly, deleteCoupon)

export default router;