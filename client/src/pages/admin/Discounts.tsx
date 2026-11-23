import { useFetchData } from "6pp";
import { ReactElement, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaTicketAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/Loader";
import { RootState, server } from "../../redux/store";
import { AllDiscountResponse } from "../../types/api.types";

interface DataType {
  code: string;
  amount: number;
  _id: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },
  {
    Header: "Coupon Code",
    accessor: "code",
  },
  {
    Header: "Discount Amount",
    accessor: "amount",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Discount = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    data,
    loading: isLoading,
    error,
  } = useFetchData<AllDiscountResponse>({
    url: `${server}/api/v1/payment/coupons/all?id=${user?._id}`,
    key: "discount-codes",
    dependencyProps: [user?._id ?? ""],
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const rows = useMemo<DataType[]>(
    () =>
      data?.allCoupons.map((coupon) => ({
        _id: coupon._id,
        code: coupon.code,
        amount: coupon.amount,
        action: (
          <NavLink
            to={`/admin/discounts/${coupon._id}`}
            className="discount-manage-link"
          >
            Manage
          </NavLink>
        ),
      })) ?? [],
    [data]
  );

  const Table = useMemo(
    () =>
      TableHOC<DataType>(
        columns,
        rows,
        "dashboard-product-box",
        "Discount Codes",
        rows.length > 6
      ),
    [rows]
  );

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="discount-list-page">
        <header className="discount-list-header">
          <div>
            <span className="discount-eyebrow">STORE MANAGEMENT</span>
            <h1>Discount Codes</h1>
            <p>Manage promotional codes and their discount amounts.</p>
          </div>

          <Link
            to="/admin/discounts/new"
            className="discount-list-add-btn"
          >
            <FaPlus />
            <span>Create Coupon</span>
          </Link>
        </header>

        <section className="discount-list-content">
          <div className="discount-list-summary">
            <div className="discount-list-summary__icon">
              <FaTicketAlt />
            </div>

            <div>
              <span>Total Coupons</span>
              <strong>{rows.length}</strong>
            </div>
          </div>

          {isLoading ? (
            <SkeletonLoader length={8} />
          ) : error ? (
            <div className="discount-list-state">
              <h3>Unable to load discount codes</h3>
              <p>Please try refreshing the page.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="discount-list-state">
              <div className="discount-list-state__icon">
                <FaTicketAlt />
              </div>
              <h3>No discount codes yet</h3>
              <p>Create your first coupon to offer discounts to customers.</p>
              <Link to="/admin/discounts/new">
                Create your first coupon
              </Link>
            </div>
          ) : (
            <Table />
          )}
        </section>
      </main>
    </div>
  );
};

export default Discount;