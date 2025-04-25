import { Request } from "express";
import { TryCatch } from "../middlewares/errorMiddleware.js";
import {
  BaseQuery,
  PostProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { products } from "../models/productModel.js";
import ErrorHandler from "../utils/utilityClass.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
// import { faker } from "@faker-js/faker";

// * Revalidate on New, Update, Delete Product & on New Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let latestProducts = [];

  if (nodeCache.has("latest-products"))
    latestProducts = JSON.parse(nodeCache.get("latest-products") as string);
  else {
    latestProducts = await products.find({}).sort({ createdAt: -1 }).limit(5);
    nodeCache.set("latest-products", JSON.stringify(latestProducts));
  }

  res.status(200).json({
    successs: true,
    latestProducts,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (nodeCache.has("categories"))
    categories = JSON.parse(nodeCache.get("categories") as string);
  else {
    categories = await products.distinct("category");
    nodeCache.set("categories", JSON.stringify(categories));
  }

  res.status(200).json({
    successs: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let adminProducts;
  if (nodeCache.has("admin-products"))
    adminProducts = JSON.parse(nodeCache.get("admin-products") as string);
  else {
    adminProducts = await products.find({});
    nodeCache.set("admin-products", JSON.stringify(adminProducts));
  }

  res.status(200).json({
    successs: true,
    adminProducts,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (nodeCache.has(`product-${id}`)) {
    product = JSON.parse(nodeCache.get(`product-${id}`) as string);
  } else {
    product = await products.findById(id);

    if (!product) return next(new ErrorHandler("Product not found", 404));
    nodeCache.set(`product-${id}`, JSON.stringify(product));
  }

  res.status(200).json({
    successs: true,
    product,
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
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

    const [allProducts, filteredOnlyProducts] = await Promise.all([
      productsPromise,
      products.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredOnlyProducts.length / limit);

    res.status(200).json({
      successs: true,
      allProducts,
      totalPages,
    });
  }
);

export const postProduct = TryCatch(
  async (req: Request<{}, {}, PostProductRequestBody>, res, next) => {
    const { name, stock, price, category } = req.body;
    const photo = req.file;

    if (!name || !price || !stock || !category)
      return next(new ErrorHandler("Please enter all fileds", 400));

    if (!photo) return next(new ErrorHandler("Please add photo", 400));

    await products.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

   invalidateCache({product: true, admin: true})

    res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, stock, price, category } = req.body;
  const photo = req.file;
  const product = await products.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old photo deleted");
    });
    product.photo = photo.path;
  }

  // if (name) product.name = name;
  // if (price) product.price = price;
  // if (stock) product.stock = stock;
  // if (category) product.category = category;

  const fieldsToUpdate = { name, price, stock, category };

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (value !== undefined) {
      (product as any)[key] = value;
    }
  }

  await product.save();
 invalidateCache({product: true, productId: String(product._id) , admin: true})

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await products.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  rm(product.photo!, () => {
    console.log("Product photo deleted");
  });

  await product.deleteOne();
   invalidateCache({product: true, productId: String(product._id), admin: true})


  res.status(200).json({
    successs: true,
    message: "Product deleted successfully",
  });
});



export const getAllReviewsOfProdcuts = TryCatch(async (req, res, next) => {});

export const postReview = TryCatch(async (req, res, next) => {});

export const deleteReview = TryCatch(async (req, res, next) => {});

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
