import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaCopy, FaFlask, FaLock, FaShieldAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import type { RootState } from "../redux/store";
import type { NewOrderRequest } from "../types/api.types";
import { responseToast } from "../utils/features";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripeKey);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cartReducer);

  const [isProcessing, setIsProcessing] = useState(false);
  const [newOrder] = useNewOrderMutation();

  const [checkoutAmount] = useState(total);
  const [copied, setCopied] = useState(false);

  const copyTestCard = async () => {
    try {
      await navigator.clipboard.writeText("4242424242424242");
      setCopied(true);
      toast.success("Test card number copied!");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy. Please copy the number manually.");
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    if (!user?._id) {
      toast.error("Please sign in before placing your order.");
      return;
    }

    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      navigate("/search");
      return;
    }

    console.log("Checkout total:", total);
    console.log("Checkout subtotal:", subtotal);
    console.log("Checkout cart:", cartItems);

    setIsProcessing(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed. Please try again.");
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        toast.error("Payment was not completed. Please try again.");
        return;
      }

      const orderData: NewOrderRequest = {
        shippingInfo,
        orderItems: cartItems,
        subtotal,
        tax,
        discount,
        shippingCharges,
        total: checkoutAmount,
        user: user._id,
      };

      const result = await newOrder(orderData);

      if ("data" in result) {
        responseToast(result, navigate, "/orders");
        dispatch(resetCart());
      } else {
        responseToast(result, null, "");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        "Something went wrong. Please contact support if payment was deducted.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="checkout-container">
      <section className="checkout-card">
        <div className="checkout-header">
          <div className="checkout-icon">
            <FaLock />
          </div>

          <h1>Complete Your Payment</h1>

          <p>
            You're almost there! Enter your payment details below to complete
            your order.
          </p>
        </div>

        <div className="checkout-demo-notice">
          <div className="checkout-demo-notice__heading">
            <FaFlask />

            <div>
              <h2>Demo Checkout — Test Mode</h2>
              <span>No real money will be charged.</span>
            </div>
          </div>

          <p>
            This portfolio store uses Stripe's test environment. Use the test
            card below to simulate a successful payment.
          </p>

          <div className="checkout-test-card">
            <div className="checkout-test-card__label">
              <span>Test card number</span>
              <button type="button" onClick={copyTestCard}>
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <strong>4242 4242 4242 4242</strong>

            <div className="checkout-test-card__details">
              <div>
                <span>Expiry</span>
                <strong>12/30</strong>
              </div>
              <div>
                <span>CVC</span>
                <strong>123</strong>
              </div>
              <div>
                <span>ZIP</span>
                <strong>834001</strong>
              </div>
            </div>
          </div>

          <small>
            Use any cardholder name. These are Stripe test credentials, not real
            payment details.
          </small>
        </div>

        <form onSubmit={submitHandler}>
          <div className="checkout-payment">
            <h2>Payment Details</h2>
            <PaymentElement />
          </div>

          <button type="submit" disabled={!stripe || !elements || isProcessing}>
            {isProcessing
              ? "Processing Payment..."
              : `Pay ₹${checkoutAmount.toLocaleString("en-IN")}`}
          </button>
        </form>

        <div className="checkout-security">
          <FaShieldAlt />
          <span>Secure payment processing powered by Stripe.</span>
        </div>
      </section>
    </main>
  );
};

const CheckoutPage = () => {
  const location = useLocation();
  const clientSecret: string | undefined = location.state;

  if (!clientSecret) {
    return <Navigate to="/shipping" replace />;
  }

  return (
    <Elements options={{ clientSecret }} stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
