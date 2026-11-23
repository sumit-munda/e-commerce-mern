import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBox, FaCheck, FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import {
  useDeleteOrderMutation,
  useOrderDetailsQuery,
  useUpdateOrderMutation,
} from "../../../redux/api/orderAPI";
import { userReducerInitialState } from "../../../types/reducer.types";
import { OrderItem } from "../../../types/types";
import { responseToast, transformImage } from "../../../utils/features";

const statusSteps = ["Processing", "Shipped", "Delivered"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TransactionManagement = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer,
  );

  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError } = useOrderDetailsQuery(id ?? "", {
    skip: !id,
  });

  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const order = data?.order;

  const updateHandler = async () => {
    if (!order || !user?._id || isUpdating || order.status === "Delivered") return;

    const res = await updateOrder({
      userId: user?._id,
      orderId: order._id,
    });

    responseToast(res, navigate, "/admin/transactions");
  };

  const deleteHandler = async () => {
    if (!order || isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this order?",
    );

    if (!confirmed) return;

    const res = await deleteOrder({
      userId: user?._id || "",
      orderId: order._id,
    });

    responseToast(res, navigate, "/admin/transactions");
  };

  if (isError || (!isLoading && !order)) {
    return <Navigate to="/404" />;
  }

  const currentStep = statusSteps.indexOf(order?.status ?? "");
  const nextStatus =
    order?.status === "Processing"
      ? "Shipped"
      : order?.status === "Shipped"
        ? "Delivered"
        : null;

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="transaction-management-page">
        {isLoading || !order ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            <header className="transaction-detail-header">
              <div>
                <Link
                  to="/admin/transactions"
                  className="transaction-back-link"
                >
                  <FaArrowLeft /> Back to transactions
                </Link>

                <span className="transaction-eyebrow">Order management</span>
                <h1>Transaction Details</h1>
                <p>
                  Order #{order._id.slice(-8).toUpperCase()} ·{" "}
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <button
                className="transaction-delete-btn"
                onClick={deleteHandler}
                disabled={isDeleting}
              >
                <FaTrash />
                {isDeleting ? "Deleting..." : "Delete order"}
              </button>
            </header>

            <section className="transaction-status-card">
              <div className="transaction-section-heading">
                <div>
                  <span className="transaction-eyebrow">Fulfillment</span>
                  <h2>Order status</h2>
                </div>

                <span
                  className={`transaction-status-badge ${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="transaction-progress">
                {statusSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`transaction-progress-step ${
                      index <= currentStep ? "completed" : ""
                    }`}
                  >
                    <span className="transaction-progress-icon">
                      {index < currentStep ? <FaCheck /> : index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="transaction-status-action">
                <p>
                  {nextStatus
                    ? `Move this order to ${nextStatus}.`
                    : "This order has been successfully delivered."}
                </p>

                <button
                  className="transaction-primary-btn"
                  onClick={updateHandler}
                  disabled={!nextStatus || isUpdating}
                >
                  {isUpdating
                    ? "Updating..."
                    : nextStatus
                      ? `Mark as ${nextStatus}`
                      : "Order completed"}
                </button>
              </div>
            </section>

            <div className="transaction-detail-grid">
              <div className="transaction-detail-main">
                <section className="transaction-panel">
                  <div className="transaction-section-heading">
                    <div>
                      <span className="transaction-eyebrow">Items</span>
                      <h2>Order items</h2>
                    </div>
                    <span className="transaction-item-count">
                      {order.orderItems.length}{" "}
                      {order.orderItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="transaction-items-list">
                    {order.orderItems.map((item) => (
                      <ProductCard key={item._id} {...item} />
                    ))}
                  </div>
                </section>

                <section className="transaction-panel">
                  <div className="transaction-section-heading">
                    <div>
                      <span className="transaction-eyebrow">Delivery</span>
                      <h2>Shipping information</h2>
                    </div>
                    <FaBox />
                  </div>

                  <div className="transaction-address">
                    <h3>{order.user.name}</h3>
                    <p>{order.shippingInfo.address}</p>
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.state}
                    </p>
                    <p>
                      {order.shippingInfo.country} -{" "}
                      {order.shippingInfo.pinCode}
                    </p>
                  </div>
                </section>
              </div>

              <aside className="transaction-detail-sidebar">
                <section className="transaction-panel transaction-customer-card">
                  <span className="transaction-eyebrow">Customer</span>
                  <h2>{order.user.name}</h2>
                  <p>Customer ID: {order.user._id}</p>
                </section>

                <section className="transaction-panel transaction-summary-card">
                  <span className="transaction-eyebrow">Payment breakdown</span>
                  <h2>Order summary</h2>

                  <div className="transaction-summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  <div className="transaction-summary-row">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingCharges)}</span>
                  </div>

                  <div className="transaction-summary-row">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>

                  <div className="transaction-summary-row">
                    <span>Discount</span>
                    <span className="transaction-discount">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>

                  <div className="transaction-summary-total">
                    <span>Total amount</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <article className="transaction-product-card">
    <img src={transformImage(photo)} alt={name} />

    <div className="transaction-product-info">
      <Link to={`/products/${productId}`}>{name}</Link>
      <span>
        {formatCurrency(price)} × {quantity}
      </span>
    </div>

    <strong>{formatCurrency(price * quantity)}</strong>
  </article>
);

export default TransactionManagement;
