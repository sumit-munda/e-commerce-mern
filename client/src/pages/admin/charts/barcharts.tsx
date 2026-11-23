import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import { BarChart } from "../../../components/admin/Charts";
import { SkeletonLoader } from "../../../components/Loader";
import { useBarQuery } from "../../../redux/api/dashboardAPI";
import { RootState } from "../../../redux/store";
import { CustomError } from "../../../types/api.types";
import { getLastMonths } from "../../../utils/features";

const { last6Months, last12Months } = getLastMonths();

const Barcharts = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useBarQuery(user?._id ?? "", {
    skip: !user?._id,
  });

  const products = data?.charts.products ?? [];
  const orders = data?.charts.orders ?? [];
  const users = data?.charts.users ?? [];

  useEffect(() => {
    if (isError) {
      const err = error as CustomError;
      toast.error(err?.data?.message || "Unable to load chart data.");
    }
  }, [isError, error]);

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="chart-container">
        <header className="chart-page-header">
          <span className="chart-page-eyebrow">Analytics & Reports</span>
          <h1>Bar Charts</h1>
          <p>
            Monitor product growth, customer activity, and order volume.
          </p>
        </header>

        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : isError ? (
          <div className="chart-state">
            <h2>Unable to load analytics</h2>
            <p>Please try again later.</p>
          </div>
        ) : !data ? (
          <div className="chart-state">
            <h2>No analytics available</h2>
            <p>Chart data will appear here when available.</p>
          </div>
        ) : (
          <>
            <section>
              <div className="chart-section-heading">
                <div>
                  <span>OVERVIEW</span>
                  <h2>Products & Customers</h2>
                  <p>Monthly comparison over the last six months.</p>
                </div>
              </div>

              <BarChart
                data_1={products}
                data_2={users}
                labels={last6Months}
                title_1="Products"
                title_2="Users"
                bgColor_1="hsl(137, 20%, 42%)"
                bgColor_2="hsl(145, 25%, 78%)"
              />
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>ORDER ACTIVITY</span>
                  <h2>Orders Throughout the Year</h2>
                  <p>Monthly order volume over the last twelve months.</p>
                </div>
              </div>

              <BarChart
                horizontal
                data_1={orders}
                data_2={[]}
                title_1="Orders"
                title_2=""
                bgColor_1="hsl(137, 20%, 42%)"
                bgColor_2=""
                labels={last12Months}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Barcharts;