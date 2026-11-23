import { useEffect } from "react";
import toast from "react-hot-toast";
import { FaArrowRight, FaBoxOpen, FaImage } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SkeletonLoader } from "../components/Loader";
import { useMyOrdersQuery } from "../redux/api/orderAPI";
import { RootState } from "../redux/store";
import { CustomError } from "../types/api.types";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const OrdersPage = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useMyOrdersQuery(
    user?._id ?? "",
    {
      skip: !user?._id,
    },
  );

  useEffect(() => {
    if (isError) {
      const err = error as CustomError;
      toast.error(err.data?.message || "Unable to load your orders.");
    }
  }, [isError, error]);

  const orders = [...(data?.userOrders ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (isLoading) {
    return (
      <main className="orders-page">
        <div className="orders-container">
          <div className="orders-heading">
            <span className="orders-eyebrow">YOUR ACCOUNT</span>
            <h1>My Orders</h1>
            <p>Track and manage your recent purchases.</p>
          </div>
          <SkeletonLoader length={4} />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="orders-page">
        <div className="orders-container">
          <div className="orders-heading">
            <span className="orders-eyebrow">YOUR ACCOUNT</span>
            <h1>My Orders</h1>
          </div>
          <div className="orders-empty">
            <FaBoxOpen />
            <h2>Couldn't load your orders</h2>
            <p>Please try refreshing the page.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        <div className="orders-heading">
          <span className="orders-eyebrow">YOUR ACCOUNT</span>
          <h1>My Orders</h1>
          <p>Track and manage your recent purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <FaBoxOpen />
            <h2>No orders yet</h2>
            <p>Your purchases will appear here once you place an order.</p>
            <Link to="/search" className="orders-shop-button">
              Explore Products <FaArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-summary">
              <span>
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
              <span>Showing your recent purchases</span>
            </div>

            <div className="orders-list">
              {orders.map((order) => {
                const firstItem = order.orderItems[0];
                const totalQuantity = order.orderItems.reduce(
                  (total, item) => total + item.quantity,
                  0,
                );

                const statusClass = order.status
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <article className="order-card" key={order._id}>
                    <div className="order-card__top">
                      <div>
                        <span className="order-card__label">ORDER PLACED</span>
                        <strong>{formatDate(order.createdAt)}</strong>
                      </div>

                      <div>
                        <span className="order-card__label">ORDER ID</span>
                        <strong title={order._id}>
                          #{order._id.slice(-8).toUpperCase()}
                        </strong>
                      </div>

                      <span
                        className={`order-status order-status--${statusClass}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="order-card__body">
                      <div className="order-card__product">
                        {firstItem?.photo ? (
                          <img
                            src={firstItem.photo}
                            alt={firstItem.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="order-card__image-placeholder">
                            <FaImage />
                          </div>
                        )}

                        <div className="order-card__product-info">
                          <h2>{firstItem?.name || "Order items"}</h2>
                          <p>
                            {totalQuantity}{" "}
                            {totalQuantity === 1 ? "item" : "items"}
                            {order.orderItems.length > 1 &&
                              ` · ${order.orderItems.length} different products`}
                          </p>
                        </div>
                      </div>

                      <div className="order-card__total">
                        <span className="order-card__label">ORDER TOTAL</span>
                        <strong>{formatCurrency(order.total)}</strong>
                      </div>

                      <Link
                        to={`/order/${order._id}`}
                        className="order-card__action"
                      >
                        View Order <FaArrowRight />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
