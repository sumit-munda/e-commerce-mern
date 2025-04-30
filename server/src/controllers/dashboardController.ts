import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/errorMiddleware.js";
import { orders } from "../models/orderModel.js";
import { products } from "../models/productModel.js";
import { users } from "../models/userModel.js";
import {
  calculatePercentage,
  getChartData,
  getInventories,
} from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};

  const key = "admin-stats";

  if (nodeCache.has(key)) stats = JSON.parse(nodeCache.get(key) as string);
  else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth() - 1, 0),
    };

    const thisMonthProductsPromise = await products.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = await products.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = await users.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = await users.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = await orders.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = await orders.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = await orders.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionsPromise = orders
      .find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthOrders,
      thisMonthUsers,
      lastMonthProducts,
      lastMonthOrders,
      lastMonthUsers,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransactions,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthOrdersPromise,
      thisMonthUsersPromise,
      lastMonthProductsPromise,
      lastMonthOrdersPromise,
      lastMonthUsersPromise,
      products.countDocuments(),
      users.countDocuments(),
      orders.find({}).select("total"),
      lastSixMonthOrdersPromise,
      products.distinct("category"),
      users.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercentage = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,
      order: allOrders.length,
    };

    const orderMonthCounts =getChartData({
        length: 6, today, docArr: lastSixMonthOrders
    })
    const orderMonthlyRevenue = getChartData({
        length: 6,
        today,
        docArr: lastSixMonthOrders, property: "total"
    })

    const categoryCount: Record<string, number>[] = await getInventories({
      categories,
      productsCount,
    });

    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransactions = latestTransactions.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercentage,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      latestTransactions: modifiedLatestTransactions,
    };

    nodeCache.set(key, JSON.stringify(stats));
  }

  res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;

  const key = "admin-pie-charts";

  if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
  else {
    const allOrderPromise = orders
      .find({})
      .select(["total", "discount", "subtotal", "tax", "shippingCharges"]);

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productsCount,
      outOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      orders.countDocuments({ status: "Processing" }),
      orders.countDocuments({ status: "Shipped" }),
      orders.countDocuments({ status: "Delivered" }),
      products.distinct("category"),
      products.countDocuments(),
      products.countDocuments({ stock: 0 }),
      allOrderPromise,
      users.find({}).select(["dob"]),
      users.countDocuments({ role: "admin" }),
      users.countDocuments({ role: "user" }),
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    const stockAvailability = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const usersAgeGroup = {
      teen: allUsers.filter((i) => Number(i.age) < 20).length,
      adult: allUsers.filter((i) => Number(i.age) >= 20 && Number(i.age) < 40)
        .length,
      old: allUsers.filter((i) => Number(i.age) > 40).length,
    };

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailability,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    nodeCache.set(key, JSON.stringify(charts));
  }

  res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";

  if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
  else {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sixMonthProductPromise = products
      .find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const sixMonthUsersPromise = users
      .find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const twelveMonthOrdersPromise = orders
      .find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const [productsDocs, usersDocs, ordersDocs] = await Promise.all([
      sixMonthProductPromise,
      sixMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    const productsCounts = getChartData({
      length: 6,
      today,
      docArr: productsDocs,
    });
    const usersCounts = getChartData({ length: 6, today, docArr: usersDocs });
    const ordersCounts = getChartData({ length: 6, today, docArr: ordersDocs });

    charts = {
      users: usersCounts,
      products: productsCounts,
      orders: ordersCounts,
    };

    nodeCache.set(key, JSON.stringify(charts));
  }

  res.status(200).json({
    success: true,
    charts,
  });
});
export const getLineCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";

  if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
  else {
    const today = new Date();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    };

    const twelveMonthProductsPromise = products
      .find(baseQuery)
      .select("createdAt");

    const twelveMonthUsersPromise = users.find(baseQuery).select("createdAt");

    const twelveMonthOrdersPromise = orders.find(baseQuery).select(["createdAt", "discount", "total"]);

    const [productsDocs, usersDocs, ordersDocs] = await Promise.all([
      twelveMonthProductsPromise,
      twelveMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    const productsCounts = getChartData({
      length: 12,
      today,
      docArr: productsDocs,
    });
    const usersCounts = getChartData({ length: 12, today, docArr: usersDocs });

    const discount = getChartData({
      length: 12,
      today,
      docArr: ordersDocs,
      property: "discount",
    });

    const revenue = getChartData({
      length: 12,
      today,
      docArr: ordersDocs,
      property: "total",
    });

    charts = {
      users: usersCounts,
      products: productsCounts,
      discount,
      revenue
    };

    nodeCache.set(key, JSON.stringify(charts));
  }

  res.status(200).json({
    success: true,
    charts,
  });
});
