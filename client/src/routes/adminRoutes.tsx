import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ProductManagement from "../pages/admin/management/ProductManagement";

const DashBoard = lazy(() => import("../pages/admin/Dashboard"));
const Products = lazy(() => import("../pages/admin/Products"));
const Customers = lazy(() => import("../pages/admin/Customers"));
const Transactions = lazy(() => import("../pages/admin/Transactions"));
const Discounts = lazy(() => import("../pages/admin/Discounts"));
const BarCharts = lazy(() => import("../pages/admin/charts/BarCharts"));
const PieCharts = lazy(() => import("../pages/admin/charts/PieCharts"));
const LineCharts = lazy(() => import("../pages/admin/charts/LineCharts"));

const NewProduct = lazy(() => import("../pages/admin/management/NewProduct"));
const TransactionManagement = lazy(
  () => import("../pages/admin/management/TransactionManagement"),
);
const DiscountManagement = lazy(
  () => import("../pages/admin/management/DiscountManagement"),
);
const NewDiscount = lazy(() => import("../pages/admin/management/NewDiscount"));

const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      {
        element: <ProtectedRoute adminOnly />,
        children: [
          {
            path: "/admin/dashboard",
            element: <DashBoard />,
          },
          {
            path: "/admin/products",
            element: <Products />,
          },
          {
            path: "/admin/customers",
            element: <Customers />,
          },
          { path: "/admin/transactions", element: <Transactions /> },
          {
            path: "/admin/discounts",
            element: <Discounts />,
          },

          {
            path: "/admin/charts/bar",
            element: <BarCharts />,
          },
          {
            path: "/admin/charts/pie",
            element: <PieCharts />,
          },
          {
            path: "/admin/charts/line",
            element: <LineCharts />,
          },

          {
            path: "/admin/products/new",
            element: <NewProduct />,
          },
          {
            path: "/admin/products/:id",
            element: <ProductManagement />,
          },

          {
            path: "/admin/transactions/:id",
            element: <TransactionManagement />,
          },

          {
            path: "/admin/discounts/new",
            element: <NewDiscount />,
          },
          {
            path: "/admin/discounts/:id",
            element: <DiscountManagement />,
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
