import { useFetchData } from "6pp";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaTicketAlt, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import { RootState, server } from "../../../redux/store";
import { SingleDiscountResponse } from "../../../types/api.types";

const DiscountManagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data,
    loading: isLoading,
    error,
  } = useFetchData<SingleDiscountResponse>({
    url: `${server}/api/v1/payment/coupons/${id}?id=${user?._id}`,
    key: "discount-code",
    dependencyProps: [user?._id || ""],
  });

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (data?.coupon) {
      setCode(data.coupon.code);
      setAmount(String(data.coupon.amount));
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    const discountAmount = Number(amount);

    if (
      !trimmedCode ||
      !Number.isFinite(discountAmount) ||
      discountAmount <= 0
    ) {
      toast.error("Enter a valid coupon code and discount amount.");
      return;
    }

    if (!user?._id || !id) {
      toast.error("Unable to identify the coupon or admin.");
      return;
    }

    setIsUpdating(true);

    try {
      const { data } = await axios.put(
        `${server}/api/v1/payment/coupons/${id}?id=${user._id}`,
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

      toast.error(message || "Unable to update coupon. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteHandler = async () => {
    if (!user?._id || !id || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${code}"?`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const { data } = await axios.delete(
        `${server}/api/v1/payment/coupons/${id}?id=${user._id}`,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/admin/discounts");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Unable to delete coupon. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <main className="discount-form-page">
          <SkeletonLoader length={12} />
        </main>
      </div>
    );
  }

  if (!data?.coupon) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <main className="discount-form-page">
          <section className="discount-form-card">
            <h2>Coupon not found</h2>
            <p>This coupon may have been deleted or is unavailable.</p>
            <button
              className="discount-form-submit"
              onClick={() => navigate("/admin/discounts")}
            >
              Back to discounts
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="discount-form-page">
        <header className="discount-form-header">
          <span className="discount-eyebrow">Promotions</span>
          <h1>Manage coupon</h1>
          <p>Update the coupon code or change its discount amount.</p>
        </header>

        <section className="discount-form-card">
          <div className="discount-form-card__icon">
            <FaTicketAlt />
          </div>

          <div className="discount-form-card__heading">
            <h2>Edit coupon details</h2>
            <p>Changes will apply to future coupon redemptions.</p>
          </div>

          <button
            type="button"
            className="discount-delete-btn"
            onClick={deleteHandler}
            disabled={isDeleting || isUpdating}
          >
            <FaTrash />
            {isDeleting ? "Deleting coupon..." : "Delete coupon"}
          </button>

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
              disabled={isUpdating || isDeleting}
            >
              <FaSave />
              {isUpdating ? "Updating coupon..." : "Save changes"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default DiscountManagement;