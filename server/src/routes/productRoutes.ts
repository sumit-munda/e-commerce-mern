import { Router } from "express";
import { singleUpload } from "../middlewares/mutlerMiddleware.js";
import {
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getAllReviewsOfProdcuts,
  getLatestProducts,
  getSingleProduct,
  postProduct,
  postReview,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/latest", getLatestProducts);
router.get("/categories", getAllCategories);
router.get("/admin-products",adminOnly,  getAdminProducts);

router.post("/", adminOnly, singleUpload, postProduct);

router
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

router.route("/reviews/:id").get(getAllReviewsOfProdcuts).post(postReview);

router.delete("/reveiews/:id", deleteReview);
export default router;
