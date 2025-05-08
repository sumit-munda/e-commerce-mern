import mongoose from "mongoose";
import { nodeCache, redis } from "../app.js";
import { products } from "../models/productModel.js";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { reviews } from "../models/reviewModel.js";
import { Redis } from "ioredis";

// * getBase64 is typically used to convert uploaded image files to base64 format
const getBase64 = (file: Express.Multer.File) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const promises = files.map(async (file) => {
    return new Promise<UploadApiResponse | undefined>((resolve, reject) => {
      cloudinary.uploader.upload(getBase64(file), (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });

  const result = await Promise.all(promises);

  return result.map((i) => ({
    public_id: i?.public_id,
    url: i?.secure_url,
  }));
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  const promises = publicIds.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export const connectRedis = () => {
  const redis = new Redis(process.env.REDIS_URI!);

  redis.on("connect", () => console.log("Redis Connected"));
  redis.on("error", (e) => console.log("Redis Error", e));
  return redis;
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (review) {
    await redis.del([`reveiws-${productId}`]);
  }
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
      "admin-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => {
        productKeys.push(`product-${i}`);
      });
    // nodeCache.del(productKeys);

    await redis.del(productKeys);
  }

  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      `user-orders-${userId}`,
      `order-${orderId}`,
    ];

    // nodeCache.del(orderKeys);
    await redis.del(orderKeys);
  }

  if (admin) {
    // nodeCache.del([
    await redis.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await products.findById(order.productId);

    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};

export const nodeCacheFun = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  if (nodeCache.has(key)) {
    const cached = nodeCache.get(key) as string;
    return JSON.parse(cached) as T;
  } else {
    const value = await fetcher();
    nodeCache.set(key, JSON.stringify(value));
    return value;
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percentage = (thisMonth / lastMonth) * 100;
  return Number(percentage.toFixed(0));
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    products.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round(categoriesCount[i] / productsCount) * 100,
    });
  });

  return categoryCount;
};

interface MyDocument {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};

export const findAverageRating = async (productId: mongoose.Types.ObjectId) => {
  let totalRating = 0;

  const productReviews = await reviews.find({ product: productId });
  productReviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averateRating = Math.floor(totalRating / productReviews.length) || 0;

  return {
    numOfReviews: productReviews.length,
    ratings: averateRating,
  };
};
