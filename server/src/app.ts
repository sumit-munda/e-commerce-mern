import express from "express";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import "dotenv/config";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import connectToDB from "./config/db.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import Stripe from "stripe";
import cors from 'cors'

export const stripe = new Stripe(process.env.STRIPE_KEY as string)

export const nodeCache = new NodeCache();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))
app.use(cors())

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.get("/api/v1", (req, res) => {
  res.send("Testing API...");
});

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);


const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () =>
      console.log(`Server is working on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error);
  }
};

startServer();
