import { Request } from "express";
import { TryCatch } from "../middlewares/errorMiddleware.js";
import { PostOrderRequestBody } from "../types/types.js";
import { orders } from "../models/orderModel.js";
import {
  invalidateCache,
  nodeCacheFun,
  reduceStock,
} from "../utils/features.js";
import ErrorHandler from "../utils/utilityClass.js";
import { nodeCache, redis, redisTTL } from "../app.js";

export const getUserOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  const key = `user-orders-${user}`;

  let userOrders;
  userOrders = await redis.get(key);

  // if (nodeCache.has(key)) userOrders = JSON.parse(nodeCache.get(key) as string);

  if (userOrders) userOrders = JSON.parse(userOrders);
  else {
    userOrders = await orders.find({ user });

    // nodeCache.set(key, JSON.stringify(userOrders));
    await redis.setex(key, redisTTL, JSON.stringify(userOrders));
  }

  res.status(200).json({
    success: true,
    userOrders,
  });
});

export const getAllOrders = TryCatch(async (req, res, next) => {
  const key = `all-orders`;

  let allOrders;
  allOrders = await redis.get(key);

  // if (nodeCache.has(key)) allOrders = JSON.parse(nodeCache.get(key) as string);

  if (allOrders) allOrders = JSON.parse(allOrders);
  else {
    // allOrders = await nodeCacheFun(key, () =>
    //   orders.find().populate("user", "name")
    // );

    allOrders = await orders.find().populate("user", "name");
    await redis.setex(key, redisTTL, JSON.stringify(allOrders));
  }

  res.status(200).json({
    success: true,
    allOrders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;
  order = await redis.get(key);

  // if (nodeCache.has(key)) order = JSON.parse(nodeCache.get(key) as string);
  if (order) order = JSON.parse(order);
  else {
    order = await orders.findById(id).populate("user", "name");
    if (!order) return next(new ErrorHandler("Order not found", 404));
    // nodeCache.set(key, JSON.stringify(order));

    await redis.setex(key, redisTTL, JSON.stringify(order));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const postOrder = TryCatch(
  async (req: Request<{}, {}, PostOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("Please enter all fields", 400));

    const order = await orders.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
    });
  }
);

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await orders.findById(id);

  if (!order) return next(new ErrorHandler("Order not found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;

    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }

  await order.save();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await orders.findById(id);

  if (!order) return next(new ErrorHandler("Order not found", 404));

  await order.deleteOne();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
