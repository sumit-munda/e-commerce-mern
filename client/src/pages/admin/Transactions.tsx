import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import toast from "react-hot-toast";
import { FaArrowRight, FaReceipt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import type { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/Loader";
import { useAllOrdersQuery } from "../../redux/api/orderAPI";
import type { RootState } from "../../redux/store";
import type { CustomError } from "../../types/api.types";

interface DataType {
  orderId: string;
  customer: ReactElement;
  date: string;
  items: number;
  amount: string;
  status: ReactElement;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  { Header: "Order ID", accessor: "orderId" },
  { Header: "Customer", accessor: "customer" },
  { Header: "Date", accessor: "date" },
  { Header: "Items", accessor: "items" },
  { Header: "Total", accessor: "amount" },
  { Header: "Status", accessor: "status" },
  { Header: "Action", accessor: "action" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const Transaction = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useAllOrdersQuery(
    user?._id ?? "",
    {
      skip: !user?._id,
    },
  );

  const orders = useMemo(() => data?.allOrders ?? [], [data?.allOrders]);

  useEffect(() => {
    if (isError) {
      const err = error as CustomError;
      toast.error(err.data?.message || "Unable to load transactions.");
    }
  }, [isError, error]);

  const rows = useMemo<DataType[]>(
    () =>
      orders.map((order) => {
        const customerName = order.user?.name || "Unknown customer";

        const initials = customerName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();

        const totalItems = order.orderItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        const statusClass =
          order.status === "Delivered"
            ? "is-delivered"
            : order.status === "Shipped"
              ? "is-shipped"
              : order.status === "Processing"
                ? "is-processing"
                : "is-other";

        return {
          orderId: `#${order._id.slice(-8).toUpperCase()}`,

          customer: (
            <div className="transaction-customer">
              <div className="transaction-customer__avatar">
                {initials || "?"}
              </div>
              <span>{customerName}</span>
            </div>
          ),

          date: formatDate(order.createdAt),
          items: totalItems,
          amount: formatCurrency(order.total),

          status: (
            <span className={`transaction-status ${statusClass}`}>
              <span className="transaction-status__dot" />
              {order.status || "Unknown"}
            </span>
          ),

          action: (
            <NavLink
              className="transaction-manage-link"
              to={`/admin/transactions/${order._id}`}
            >
              Manage <FaArrowRight />
            </NavLink>
          ),
        };
      }),
    [orders],
  );

  const Table = useMemo(
    () =>
      TableHOC<DataType>(
        columns,
        rows,
        "transactions-table-container",
        "Transaction History",
        rows.length > 6,
      ),
    [rows],
  );

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="admin-transactions-page">
        <header className="admin-transactions-header">
          <div>
            <span className="admin-transactions-eyebrow">ORDER MANAGEMENT</span>
            <h1>Transactions</h1>
            <p>Monitor orders, payment totals and fulfillment status.</p>
          </div>

          <div className="admin-transactions-count">
            <FaReceipt />
            <span>{orders.length.toLocaleString("en-IN")} orders</span>
          </div>
        </header>

        {isLoading ? (
          <SkeletonLoader length={10} />
        ) : isError ? (
          <section className="transactions-state">
            <FaReceipt />
            <h2>Unable to load transactions</h2>
            <p>Please try again later.</p>
          </section>
        ) : orders.length === 0 ? (
          <section className="transactions-state">
            <FaReceipt />
            <h2>No transactions yet</h2>
            <p>Orders placed by customers will appear here.</p>
          </section>
        ) : (
          <section className="transactions-table-section">
            <div className="transactions-table-toolbar">
              <div>
                <h2>All Orders</h2>
                <p>Review and manage customer orders.</p>
              </div>

              <span>
                {orders.length} records <FaArrowRight />
              </span>
            </div>

            <Table />
          </section>
        )}
      </main>
    </div>
  );
};

export default Transaction;
