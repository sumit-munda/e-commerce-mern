import axios from "axios";
import { useEffect, useState } from "react";
import { FaArrowRight, FaShoppingBag, FaTag } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";
import {
  addToCart,
  calculatePrice,
  discountApplied,
  removeCartItem,
} from "../redux/reducer/cartReducer";
import { server } from "../redux/store";
import { CartReducerInitialState } from "../types/reducer.types";
import { CartItem } from "../types/types";

type CouponStatus = "idle" | "checking" | "valid" | "invalid";

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const CartPage = () => {
  const { cartItems, subtotal, tax, total, shippingCharges, discount } =
    useSelector(
      (state: { cartReducer: CartReducerInitialState }) => state.cartReducer,
    );

  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");

  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity >= cartItem.stock) return;

    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };

  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;

    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };

  const removeHandler = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  // Recalculate whenever cart contents or discount changes.
  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems, discount, dispatch]);

  // Validate coupon after the user stops typing.
  useEffect(() => {
    const code = couponCode.trim();
    const { token, cancel } = axios.CancelToken.source();

    if (!code || cartItems.length === 0) {
      dispatch(discountApplied(0));
      setCouponStatus("idle");

      return () => cancel();
    }

    dispatch(discountApplied(0));
    setCouponStatus("checking");

    const timeOutId = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount`, {
          params: { coupon: code },
          cancelToken: token,
        })
        .then((response) => {
          dispatch(discountApplied(response.data.discount));
          setCouponStatus("valid");
        })
        .catch((error) => {
          if (axios.isCancel(error)) return;

          dispatch(discountApplied(0));
          setCouponStatus("invalid");
        });
    }, 700);

    return () => {
      clearTimeout(timeOutId);
      cancel();
    };
  }, [couponCode, cartItems.length, dispatch]);

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="cart-page">
      <header className="cart-page__header">
        <div>
          <span className="cart-page__eyebrow">YOUR SHOPPING BAG</span>
          <h1>Shopping Cart</h1>
          <p>
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <Link to="/search" className="cart-page__continue">
          Continue shopping <FaArrowRight />
        </Link>
      </header>

      {cartItems.length > 0 ? (
        <div className="cart-page__content">
          <main className="cart-page__items">
            <div className="cart-page__section-heading">
              <h2>Your Items</h2>
              <span>{itemCount} items</span>
            </div>

            {cartItems.map((item) => (
              <CartItemCard
                key={item.productId}
                cartItem={item}
                incrementHandler={incrementHandler}
                decrementHandler={decrementHandler}
                removeHandler={removeHandler}
              />
            ))}
          </main>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary__coupon">
              <label htmlFor="coupon-code">
                <FaTag /> Apply coupon
              </label>

              <input
                type="text"
                id="coupon-code"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                autoComplete="off"
                aria-describedby="coupon-feedback"
              />

              <div
                id="coupon-feedback"
                className={`cart-summary__coupon-feedback cart-summary__coupon-feedback--${couponStatus}`}
                aria-live="polite"
              >
                {couponStatus === "checking" && "Checking coupon..."}
                {couponStatus === "valid" &&
                  `${formatPrice(discount)} discount applied.`}
                {couponStatus === "invalid" && "Invalid coupon code."}
              </div>
            </div>

            <div className="cart-summary__breakdown">
              <div>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div>
                <span>Shipping</span>
                <span>
                  {shippingCharges === 0
                    ? "FREE"
                    : formatPrice(shippingCharges)}
                </span>
              </div>

              <div>
                <span>Tax (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="cart-summary__discount">
                <span>Discount</span>
                <span>- {formatPrice(discount)}</span>
              </div>
            </div>

            <div className="cart-summary__total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <Link to="/shipping" className="cart-summary__checkout">
              Proceed to checkout <FaArrowRight />
            </Link>

            <p className="cart-summary__note">
              Shipping and taxes are calculated based on your order.
            </p>
          </aside>
        </div>
      ) : (
        <div className="cart-page__empty">
          <div className="cart-page__empty-icon">
            <FaShoppingBag />
          </div>

          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>

          <Link to="/search">
            Explore products <FaArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
