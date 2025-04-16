import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/App.scss";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./layouts/MainLayout";

const user = { _id: 5, name: "", role: "" };

const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const CheckOutPage = lazy(() => import("./pages/CheckOutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// * Admin Routes Importing

const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const ProductManagement = lazy(
  () => import("./pages/admin/management/productmanagement")
);
const TransactionManagement = lazy(
  () => import("./pages/admin/management/transactionmanagement")
);

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },

      // * Not Logged In Route
      {
        path: "/login",
        element: (
          // <ProtectedRoute isAuthenticated={user ? false : true}>
            <LoginPage />
          // </ProtectedRoute>
        ),
      },

      // * Logged In User Routes
      {
        element: <ProtectedRoute isAuthenticated={user ? true : false} />,
        children: [
          { path: "/shipping", element: <ShippingPage /> },
          { path: "/orders", element: <OrdersPage /> },
          { path: "/order/:id", element: <OrderDetailsPage /> },
          { path: "/pay", element: <CheckOutPage /> },
        ],
      },
      // * Admin Routes
      {
        element: (
          <ProtectedRoute
            isAuthenticated={true}
            adminOnly={true}
            admin={user?.role === "admin" ? true : false}
          />
        ),

        children: [
          { path: "/admin/dashboard", element: <Dashboard /> },
          { path: "/admin/product", element: <Products /> },
          { path: "/admin/customer", element: <Customers /> },
          { path: "/admin/transaction", element: <Transaction /> },
          { path: "/admin/chart/bar", element: <Barcharts /> },
          { path: "/admin/chart/pie", element: <Piecharts /> },
          { path: "/admin/chart/line", element: <Linecharts /> },
          { path: "/admin/app/coupon", element: <Coupon /> },
          { path: "/admin/app/stopwatch", element: <Stopwatch /> },
          { path: "/admin/app/toss", element: <Toss /> },

          // * Management
          { path: "/admin/product/new", element: <NewProduct /> },
          { path: "/admin/product/:id", element: <ProductManagement /> },
          {
            path: "/admin/transaction/:id",
            element: <TransactionManagement />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
