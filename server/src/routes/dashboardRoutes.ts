import { Router } from "express"
import { adminOnly } from "../middlewares/authMiddleware.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/dashboardController.js";

const router = Router();

router.get("/stats", adminOnly, getDashboardStats);
router.get("/pie", adminOnly, getPieCharts);
router.get("/bar", adminOnly, getBarCharts);
router.get("/line", adminOnly, getLineCharts);

export default router;