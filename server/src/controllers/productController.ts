import { Request } from "express";
import { TryCatch } from "../middlewares/errorMiddleware.js";
import {
  BaseQuery,
  Photo,
  PostProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { products } from "../models/productModel.js";
import ErrorHandler from "../utils/utilityClass.js";
import { nodeCache, redis, redisTTL } from "../app.js";
import {
  deleteFromCloudinary,
  findAverageRating,
  invalidateCache,
  uploadToCloudinary,
} from "../utils/features.js";
import { Types } from "mongoose";
import { reviews } from "../models/reviewModel.js";
import { users } from "../models/userModel.js";
// import { faker } from "@faker-js/faker";

// * Revalidate on New, Update, Delete Product & on New Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let latestProducts;
  latestProducts = await redis.get("latest-products");

  // if (nodeCache.has("latest-products"))

  if (latestProducts)
    // latestProducts = JSON.parse(nodeCache.get("latest-products") as string);

    latestProducts = JSON.parse(latestProducts);
  else {
    latestProducts = await products.find({}).sort({ createdAt: -1 }).limit(5);

    // nodeCache.set("latest-products", JSON.stringify(latestProducts));
    await redis.setex(
      "latest-products",
      redisTTL,
      JSON.stringify(latestProducts)
    );
  }

  res.status(200).json({
    success: true,
    latestProducts,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  categories = await redis.get("categories");

  // if (nodeCache.has("categories"))
  if (categories)
    // categories = JSON.parse(nodeCache.get("categories") as string);

    categories = JSON.parse(categories);
  else {
    categories = await products.distinct("category");
    // nodeCache.set("categories", JSON.stringify(categories));

    await redis.setex("categories", redisTTL, JSON.stringify(categories));
  }

  res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let adminProducts;

  adminProducts = await redis.get("admin-products");

  // if (nodeCache.has("admin-products"))
  if (adminProducts)
    // adminProducts = JSON.parse(nodeCache.get("admin-products") as string);
    adminProducts = JSON.parse(adminProducts);
  else {
    adminProducts = await products.find({});
    // nodeCache.set("admin-products", JSON.stringify(adminProducts));

    await redis.setex(
      "admin-products",
      redisTTL,
      JSON.stringify(adminProducts)
    );
  }

  res.status(200).json({
    success: true,
    adminProducts,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
const key = `product-${id}`

  product = await redis.get(key);

  // if (nodeCache.has(`product-${id}`)) {
  if (product) {
    // product = JSON.parse(nodeCache.get(`product-${id}`) as string);

    product = JSON.parse(product);
  } else {
    product = await products.findById(id);

    if (!product) return next(new ErrorHandler("Product not found", 404));

    // nodeCache.set(`product-${id}`, JSON.stringify(product));
    await redis.setex(key, redisTTL, JSON.stringify(product));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;

    const key = `products-${search}-${sort}-${category}-${price}-${page}`;

    let allProducts;
    let totalPages;

    const cachedData = await redis.get(key);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      totalPages = data.totalPages;
      allProducts = data.products;
    } else {
      const limit = Number(process.env.PRODUCTS_PER_PAGE) || 8;
      const skip = (page - 1) * limit;

      const baseQuery: BaseQuery = {};

      if (search) {
        baseQuery.name = {
          $regex: search,
          $options: "i",
        };
      }
      if (price) {
        baseQuery.price = {
          $lte: Number(price),
        };
      }

      if (category) baseQuery.category = category;

      const productsPromise = products
        .find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

      const [productsFetched, filteredOnlyProducts] = await Promise.all([
        productsPromise,
        products.find(baseQuery),
      ]);

      allProducts = productsFetched;

      totalPages = Math.ceil(filteredOnlyProducts.length / limit);

      await redis.setex(key, 30, JSON.stringify({ products, totalPages }));
    }

    res.status(200).json({
      success: true,
      allProducts,
      totalPages,
    });
  }
);

export const postProduct = TryCatch(
  async (req: Request<{}, {}, PostProductRequestBody>, res, next) => {
    const { name, stock, price, category, description } = req.body;
    // const photo = req.file;
    const photos = req.files as Express.Multer.File[] | undefined;

    // if (!photo) return next(new ErrorHandler("Please add photo", 400));

    if (!photos) return next(new ErrorHandler("Please add photo", 400));
    if (photos.length < 1)
      return next(new ErrorHandler("Please add atleast one photo", 400));

    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 photos", 400));

    if (!name || !price || !stock || !category || !description)
      return next(new ErrorHandler("Please enter all fileds", 400));

    const photosURL = await uploadToCloudinary(photos);

    await products.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      description,
      // photo: photo.path,
      photos: photosURL,
    });

    await invalidateCache({ product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, stock, price, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;
  const product = await products.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  // if (photo) {
  //   rm(product.photo!, () => {
  //     console.log("Old photo deleted");
  //   });
  //   product.photo = photo.path;
  // }

  if (photos && photos.length > 0) {
    const photosURL = await uploadToCloudinary(photos);
    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);

    product.photos = photosURL as Types.DocumentArray<Photo>;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  const fieldsToUpdate = { name, price, stock, category };

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (value !== undefined) {
      (product as any)[key] = value;
    }
  }

  await product.save();
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await products.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  // rm(product.photo!, () => {
  //   console.log("Product photo deleted");
  // });

  const ids = product.photos.map((photo) => photo.public_id);
  console.log(ids);

  await deleteFromCloudinary(ids);

  await product.deleteOne();
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const getAllReviewsOfProdcuts = TryCatch(async (req, res, next) => {
  let productReviews;
  const key = `reviews-${req.params.id}`;

  productReviews = await redis.get(key);

  if (productReviews) productReviews = JSON.parse(productReviews);
  else {
    productReviews = await reviews
      .find({
        product: req.params.id,
      })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    await redis.setex(key, redisTTL, JSON.stringify(productReviews));
  }

  res.status(200).json({
    success: true,
    productReviews,
  });
});

export const postReview = TryCatch(async (req, res, next) => {
  const user = await users.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not logged in", 404));

  const product = await products.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await reviews.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await reviews.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRating(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review Updated" : "Review Added",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await users.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not logged in", 404));

  const review = await reviews.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review not found", 404));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) return next(new ErrorHandler("Not authorized", 401));

  await review.deleteOne();

  const product = await products.findById(review.product);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  const { ratings, numOfReviews } = await findAverageRating(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});

// const generateRandomProducts = async (count: number = 10) => {
//   const randomProducts = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\406b30fb-8deb-4da7-a87c-6e381bf1db3f.jpeg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };
//     randomProducts.push(product);
//   }

//   await products.create(randomProducts);
//   console.log({ success: true });
// };

// const deleteRandomProducts = async (count: number = 10) => {
//   const randomProducts = await products.find({}).skip(2);
//   for (let i = 0; i < randomProducts.length; i++) {
//     const product = randomProducts[i];
//     await product.deleteOne();
//   }
//   console.log({ success: true });
// };
