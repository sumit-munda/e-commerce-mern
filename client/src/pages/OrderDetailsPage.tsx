import { useSelector } from "react-redux";
import { Navigate, NavLink, useParams } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import { SkeletonLoader } from "../components/Loader";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { server } from "../redux/store";
import { userReducerInitialState } from "../types/reducer.types";
import { Order, OrderItem } from "../types/types";
import { transformImage } from "../utils/features";

const defaultData: Order = {
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },

  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: {
    name: "",
    _id: "",
  },
  _id: "",
};

const OrderDetailsPage = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const params = useParams();

  const { isLoading, data, isError } = useOrderDetailsQuery(params.id!);

  const {
    shippingInfo: { address, city, state, country, pinCode },
    status,
    subtotal,
    discount,
    shippingCharges,
    tax,
    total,
    orderItems,
  } = data?.order || defaultData;

  if (isError) return <Navigate to={"/404"} />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            <section
              style={{
                padding: "2rem",
              }}
            >
              <h2>Order Items</h2>

              {orderItems.map((i) => (
                <ProductCard
                  key={i._id}
                  name={i.name}
                  photo={i.photo}
                  productId={i.productId}
                  _id={i._id}
                  quantity={i.quantity}
                  price={i.price}
                />
              ))}
            </section>

            <article className="shipping-info-card">
              <h1>Order Info</h1>
              <h5>User Info</h5>
              <p>Name: {user?.name}</p>
              <p>
                Address:{" "}
                {`${address}, ${city}, ${state}, ${country} ${pinCode}`}
              </p>
              <h5>Amount Info</h5>
              <p>Subtotal: {subtotal}</p>
              <p>Shipping Charges: {shippingCharges}</p>
              <p>Tax: {tax}</p>
              <p>Discount: {discount}</p>
              <p>Total: {total}</p>

              <h5>Status Info</h5>
              <p>
                Status:{" "}
                <span
                  className={
                    status === "Delivered"
                      ? "purple"
                      : status === "Shipped"
                      ? "green"
                      : "red"
                  }
                >
                  {status}
                </span>
              </p>
            </article>
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
  <div className="transaction-product-card">
    <img src={transformImage(photo)} alt={name} />
    <NavLink to={`/product/${productId}`}>{name}</NavLink>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default OrderDetailsPage;
