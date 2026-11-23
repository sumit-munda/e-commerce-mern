import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheck,
  FaMapMarkerAlt,
  FaTruck,
} from "react-icons/fa";
import { Link, Navigate, useParams } from "react-router-dom";
import { SkeletonLoader } from "../components/Loader";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { transformImage } from "../utils/features";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const OrderDetailsPage = () => {
  const { id } = useParams();

  const { isLoading, data, isError } = useOrderDetailsQuery(id ?? "", {
    skip: !id,
  });

  if (!id || isError) return <Navigate to="/404" replace />;

  if (isLoading) {
    return (
      <main className="order-details-page">
        <div className="order-details-container">
          <SkeletonLoader length={12} />
        </div>
      </main>
    );
  }

  const order = data?.order;

  if (!order) return <Navigate to="/404" replace />;

  const { shippingInfo, orderItems, status } = order;

  const progressSteps = [
    { label: "Processing", icon: <FaBoxOpen /> },
    { label: "Shipped", icon: <FaTruck /> },
    { label: "Delivered", icon: <FaCheck /> },
  ];

  const currentStep = progressSteps.findIndex((step) => step.label === status);

  const totalQuantity = orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <Link to="/orders" className="order-back-link">
          <FaArrowLeft /> Back to My Orders
        </Link>

        <header className="order-details-heading">
          <div>
            <span className="orders-eyebrow">ORDER INFORMATION</span>
            <h1>Order Details</h1>
            <p>
              Order #{order._id.slice(-8).toUpperCase()}
              {" · "}
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`order-status order-status--${status
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {status}
          </span>
        </header>

        {/* Order progress */}
        <section className="order-progress-card">
          <h2>Order Status</h2>

          <div className="order-progress">
            {progressSteps.map((step, index) => {
              const isCompleted = currentStep >= 0 && index <= currentStep;

              return (
                <div
                  className={`order-progress__step ${
                    isCompleted ? "is-completed" : ""
                  }`}
                  key={step.label}
                >
                  <div className="order-progress__icon">{step.icon}</div>

                  <span>{step.label}</span>

                  {index < progressSteps.length - 1 && (
                    <div
                      className={`order-progress__line ${
                        currentStep > index ? "is-completed" : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {currentStep === -1 && (
            <p className="order-progress__note">
              Current order status: {status}
            </p>
          )}
        </section>

        {/* Products */}
        <section className="order-details-section">
          <div className="order-section-heading">
            <div>
              <h2>Items in your order</h2>
              <p>
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}{" "}
                purchased
              </p>
            </div>
          </div>

          <div className="order-items-list">
            {orderItems.map((item) => (
              <article className="order-item" key={item._id}>
                <Link
                  to={`/products/${item.productId}`}
                  className="order-item__image"
                >
                  <img
                    src={transformImage(item.photo)}
                    alt={item.name}
                    loading="lazy"
                  />
                </Link>

                <div className="order-item__info">
                  <Link
                    to={`/products/${item.productId}`}
                    className="order-item__name"
                  >
                    {item.name}
                  </Link>

                  <span>Quantity: {item.quantity}</span>
                  <span>Unit price: {formatCurrency(item.price)}</span>
                </div>

                <strong className="order-item__total">
                  {formatCurrency(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>
        </section>

        {/* Shipping and payment */}
        <div className="order-details-grid">
          <section className="order-info-card">
            <div className="order-info-card__heading">
              <FaMapMarkerAlt />
              <h2>Delivery Address</h2>
            </div>

            <strong>{order.user?.name || "Customer"}</strong>

            <p>
              {shippingInfo.address}
              <br />
              {shippingInfo.city}, {shippingInfo.state}
              <br />
              {shippingInfo.country} - {shippingInfo.pinCode}
            </p>
          </section>

          <section className="order-info-card">
            <div className="order-info-card__heading">
              <FaBoxOpen />
              <h2>Payment Summary</h2>
            </div>

            <div className="order-price-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="order-price-row">
              <span>Shipping Charges</span>
              <span>{formatCurrency(order.shippingCharges)}</span>
            </div>

            <div className="order-price-row">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>

            <div className="order-price-row order-price-row--discount">
              <span>Discount</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>

            <div className="order-price-row order-price-row--total">
              <strong>Total Paid</strong>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailsPage;
