import { onAuthStateChanged } from "firebase/auth";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth } from "./firebase";
import MainLayout from "./layouts/MainLayout";
import { getUser } from "./redux/api/userAPI";
import { userExist, userNotExist } from "./redux/reducer/userReducer";
import "./styles/App.scss";
import { userReducerInitialState } from "./types/reducer.types";

const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const CheckOutPage = lazy(() => import("./pages/CheckOutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// * Admin Routes Importing

const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Discount = lazy(() => import("./pages/admin/discount"));
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
const DiscountManagement = lazy(
  () => import("./pages/admin/management/discountmanagement")
);
const NewDiscount = lazy(
  () => import("./pages/admin/management/newdiscount")
);

const App = () => {
  const { user, loading } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Logged In");
        const data = await getUser(user.uid);
        dispatch(userExist(data.user));
      } else {
        dispatch(userNotExist());
      }
    });
  }, []);

  const router = createBrowserRouter([
    {
      element: <MainLayout user={user} />,
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
            <ProtectedRoute isAuthenticated={user ? false : true}>
              <LoginPage />
            </ProtectedRoute>
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
            { path: "/admin/discount", element: <Discount /> },
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
            {
              path: "/admin/discount/new",
              element: <NewDiscount/>
            },
            {
              path: "/admin/discount/:id",
              element: <DiscountManagement />,
            },
          ],
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster position="top-right" />
      </ErrorBoundary>
    </>
  );
};

export default App;
