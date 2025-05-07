import { useFetchData } from "6pp";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import { RootState, server } from "../../../redux/store";
import {
  SingleDiscountResponse
} from "../../../types/api.types";

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
    dependencyProps: [user?._id!],
  });

  if (error) {
    toast.error(error);
  }

  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(0);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/payment/coupons/${id}?id=${user?._id}`,
        { code, amount },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        setCode("");
        setAmount(0);
        toast.success(data.message);
        navigate("/admin/discount")
      }
    } catch (error) {
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setCode(data.coupon.code);
      setAmount(data.coupon.amount);
    }
  }, [data]);

  const deleteHandler = async () => {
    setBtnLoading(true);
    try {
      const { data } = await axios.delete(
        `${server}/api/v1/payment/coupons/${id}?id=${user?._id}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
       
        toast.success(data.message);
        navigate("/admin/discount")
      }
    } catch (error) {
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            {" "}
            <article>
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <form onSubmit={submitHandler}>
                <h2>Manage</h2>
                <div>
                  <label>Code</label>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div>
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                <button disabled={btnLoading} type="submit">
                  Update
                </button>
              </form>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default DiscountManagement;
