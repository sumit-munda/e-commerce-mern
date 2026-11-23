import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const HomePage = lazy(() => import("../pages/HomePage"));
const ShopPage = lazy(() => import("../pages/ShopPage"));
const ProductDetailsPage = lazy(() => import("../pages/ProductDetailsPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const ShippingPage = lazy(() => import("../pages/ShippingPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("../pages/OrderDetailsPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const storefrontRoutes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/shop",
        element: <ShopPage />,
      },
      {
        path: "/products/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/login",
        element: (
          <ProtectedRoute guestOnly>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/shipping",
            element: <ShippingPage />,
          },
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/:id",
            element: <OrderDetailsPage />,
          },
          {
            path: "/pay",
            element: <CheckoutPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export default storefrontRoutes;
