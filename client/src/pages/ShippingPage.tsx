import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { FaArrowRight, FaTruck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingInfo } from "../redux/reducer/cartReducer";
import { server } from "../redux/store";
import { CartReducerInitialState } from "../types/reducer.types";

const ShippingPage = () => {
  const { cartItems, total, shippingInfo: savedShippingInfo } = useSelector(
    (state: { cartReducer: CartReducerInitialState }) => state.cartReducer,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shippingInfo, setShippingInfo] = useState(savedShippingInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!/^\d{6}$/.test(shippingInfo.pinCode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      dispatch(saveShippingInfo(shippingInfo));

      const { data } = await axios.post(
        `${server}/api/v1/payment/create`,
        {
          amount: total,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      navigate("/pay", {
        state: data.clientSecret,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Unable to proceed to payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) navigate("/cart", { replace: true });
  }, [cartItems.length, navigate]);

  return (
    <div className="button">
      <button
        className="shipping-page__back"
        onClick={() => navigate("/cart")}
        aria-label="Back to cart"
      >
        <BiArrowBack />
      </button>

      <div className="shipping-page__container">
        <div className="shipping-page__intro">
          <span className="shipping-page__eyebrow">ALMOST THERE</span>

          <h1>Shipping Address</h1>

          <p>
            Where should we deliver your order? Enter your delivery details
            below.
          </p>

          <div className="shipping-page__trust">
            <FaTruck />
            <span>Secure and reliable delivery</span>
          </div>
        </div>

        <form className="shipping-form" onSubmit={submitHandler}>
          <div className="shipping-form__heading">
            <h1>Delivery Information</h1>
            <p>All fields are required.</p>
          </div>

          <div className="shipping-form__field shipping-form__field--full">
            <label htmlFor="address">Street Address</label>
            <input
              id="address"
              type="text"
              placeholder="House number, street, locality"
              name="address"
              value={shippingInfo.address}
              onChange={changeHandler}
              minLength={5}
              maxLength={200}
              autoComplete="street-address"
              required
            />
          </div>

          <div className="shipping-form__grid">
            <div className="shipping-form__field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                placeholder="Your city"
                name="city"
                value={shippingInfo.city}
                onChange={changeHandler}
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="shipping-form__field">
              <label htmlFor="state">State</label>

              <input
                id="state"
                type="text"
                placeholder="Your state"
                name="state"
                value={shippingInfo.state}
                onChange={changeHandler}
                autoComplete="address-level1"
                required
              />
            </div>

            <div className="shipping-form__field">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={shippingInfo.country}
                onChange={changeHandler}
                autoComplete="country-name"
                required
              >
                <option value="">Choose Country</option>
                <option value="India">India</option>
              </select>
            </div>

            <div className="shipping-form__field">
              <label htmlFor="pinCode">PIN Code</label>
              <input
                id="pinCode"
                type="text"
                name="pinCode"
                placeholder="6-digit PIN"
                value={shippingInfo.pinCode}
                onChange={changeHandler}
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="postal-code"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="shipping-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Preparing payment..."
            ) : (
              <>
                Continue to payment <FaArrowRight />
              </>
            )}
          </button>

          <p className="shipping-form__note">
            Your shipping information will be saved for this order.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage;
