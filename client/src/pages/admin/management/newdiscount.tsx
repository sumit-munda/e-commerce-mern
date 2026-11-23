import axios from "axios";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FaTicketAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { RootState, server } from "../../../redux/store";

const NewDiscount = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    const discountAmount = Number(amount);

    if (!trimmedCode || !Number.isFinite(discountAmount) || discountAmount <= 0) {
      toast.error("Enter a valid coupon code and discount amount.");
      return;
    }

    if (!user?._id) {
      toast.error("Admin information is unavailable. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/coupons?id=${user._id}`,
        { code: trimmedCode, amount: discountAmount },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/admin/discounts");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Unable to create coupon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="discount-form-page">
        <header className="discount-form-header">
          <span className="discount-eyebrow">Promotions</span>
          <h1>Create a coupon</h1>
          <p>Create a discount code that customers can apply at checkout.</p>
        </header>

        <section className="discount-form-card">
          <div className="discount-form-card__icon">
            <FaTicketAlt />
          </div>

          <div className="discount-form-card__heading">
            <h2>Coupon details</h2>
            <p>Enter the code and the fixed discount amount.</p>
          </div>

          <form onSubmit={submitHandler}>
            <div className="discount-form-field">
              <label htmlFor="coupon-code">Coupon code</label>
              <input
                id="coupon-code"
                type="text"
                placeholder="e.g. SAVE200"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={40}
                required
              />
              <small>Customers must enter this code at checkout.</small>
            </div>

            <div className="discount-form-field">
              <label htmlFor="coupon-amount">Discount amount (₹)</label>
              <div className="discount-amount-input">
                <span>₹</span>
                <input
                  id="coupon-amount"
                  type="number"
                  placeholder="200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <small>This is a fixed rupee discount, not a percentage.</small>
            </div>

            <div className="discount-form-preview">
              <span>Coupon value</span>
              <strong>
                ₹
                {amount && Number(amount) > 0
                  ? Number(amount).toLocaleString("en-IN")
                  : "0"}
              </strong>
            </div>

            <button
              className="discount-form-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating coupon..." : "Create coupon"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default NewDiscount;