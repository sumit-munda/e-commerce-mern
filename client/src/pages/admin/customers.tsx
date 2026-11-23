import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";
import toast from "react-hot-toast";
import { FaArrowRight, FaImage, FaTrash, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import type { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/Loader";
import {
  useAllUsersQuery,
  useDeleteUserMutation,
} from "../../redux/api/userAPI";
import type { RootState } from "../../redux/store";
import type { CustomError } from "../../types/api.types";
import { responseToast } from "../../utils/features";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: ReactElement;
  role: ReactElement;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  { Header: "Customer", accessor: "avatar" },
  { Header: "Name", accessor: "name" },
  { Header: "Gender", accessor: "gender" },
  { Header: "Email", accessor: "email" },
  { Header: "Role", accessor: "role" },
  { Header: "Action", accessor: "action" },
];

const CustomerAvatar = ({ photo, name }: { photo?: string; name: string }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="customer-avatar">
      {photo && !imageFailed ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials || <FaImage />}</span>
      )}
    </div>
  );
};

const Customers = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useAllUsersQuery(
    user?._id ?? "",
    {
      skip: !user?._id,
    },
  );

  const [deleteUser] = useDeleteUserMutation();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const deleteHandler = useCallback(async (userId: string, name: string) => {
    if (!user?._id || deletingUserId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}'s account? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingUserId(userId);

    try {
      const res = await deleteUser({
        userId,
        adminUserId: user._id,
      });

      responseToast(res, null, "");
    } catch {
      toast.error("Unable to delete this customer. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  }, [user?._id, deletingUserId, deleteUser]);

  const users = useMemo(() => data?.users ?? [], [data?.users])

  const rows = useMemo<DataType[]>(
    () =>
      users.map((customer) => ({
        avatar: <CustomerAvatar photo={customer.photo} name={customer.name} />,
        name: customer.name,
        email: customer.email,
        gender: (
          <span className="customer-gender">
            {customer.gender || "Not provided"}
          </span>
        ),
        role: (
          <span
            className={`customer-role ${
              customer.role === "admin" ? "is-admin" : "is-customer"
            }`}
          >
            {customer.role}
          </span>
        ),
        action: (
          <button
            type="button"
            className="customer-delete"
            aria-label={`Delete ${customer.name}`}
            title="Delete customer"
            disabled={deletingUserId !== null}
            onClick={() => deleteHandler(customer._id, customer.name)}
          >
            {deletingUserId === customer._id ? (
              <span className="customer-delete__loading" />
            ) : (
              <FaTrash />
            )}
          </button>
        ),
      })),
    [users, deletingUserId, deleteHandler],
  );

  const Table = useMemo(
    () =>
      TableHOC<DataType>(
        columns,
        rows,
        "customers-table-container",
        "Customer Directory",
        rows.length > 6,
      ),
    [rows],
  );

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data?.message || "Unable to load customers.");
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="admin-customers-page">
        <header className="admin-customers-header">
          <div>
            <span className="admin-customers-eyebrow">CUSTOMER MANAGEMENT</span>
            <h1>Customers</h1>
            <p>View and manage the people registered with your store.</p>
          </div>

          <div className="admin-customers-count">
            <FaUsers />
            <span>{users.length.toLocaleString("en-IN")} customers</span>
          </div>
        </header>

        {isLoading ? (
          <SkeletonLoader length={10} />
        ) : isError ? (
          <section className="customers-state">
            <FaUsers />
            <h2>Unable to load customers</h2>
            <p>Please try again later.</p>
          </section>
        ) : users.length === 0 ? (
          <section className="customers-state">
            <FaUsers />
            <h2>No customers yet</h2>
            <p>Registered customers will appear here.</p>
          </section>
        ) : (
          <section className="customers-table-section">
            <div className="customers-table-toolbar">
              <div>
                <h2>All Customers</h2>
                <p>Customer accounts and their details</p>
              </div>
              <span>
                {users.length} records <FaArrowRight />
              </span>
            </div>

            <Table />
          </section>
        )}
      </main>
    </div>
  );
};

export default Customers;
