import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import { LineChart } from "../../../components/admin/Charts";
import { SkeletonLoader } from "../../../components/Loader";
import { useLineQuery } from "../../../redux/api/dashboardAPI";
import { RootState } from "../../../redux/store";
import { CustomError } from "../../../types/api.types";
import { getLastMonths } from "../../../utils/features";

const { last12Months: months } = getLastMonths();

const Linecharts = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { data, isLoading, isError, error } = useLineQuery(user?._id ?? "", {
    skip: !user?._id,
  });

  const products = data?.charts.products ?? [];
  const users = data?.charts.users ?? [];
  const revenue = data?.charts.revenue ?? [];
  const discount = data?.charts.discount ?? [];

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
          <h1>Line Charts</h1>
          <p>
            Track business growth, revenue performance, and discount trends over
            time.
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
                  <span>CUSTOMER GROWTH</span>
                  <h2>User Activity</h2>
                  <p>Monthly user growth over the last twelve months.</p>
                </div>
              </div>

              <LineChart
                data={users}
                label="Users"
                borderColor="hsl(137, 20%, 42%)"
                labels={months}
                backgroundColor="hsla(137, 20%, 42%, 0.18)"
              />
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>PRODUCT GROWTH</span>
                  <h2>Total Products (SKU)</h2>
                  <p>Monthly product additions over the last twelve months.</p>
                </div>
              </div>

              <LineChart
                data={products}
                backgroundColor="hsla(145, 25%, 65%, 0.2)"
                borderColor="hsl(145, 25%, 50%)"
                labels={months}
                label="Products"
              />
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>FINANCIAL PERFORMANCE</span>
                  <h2>Total Revenue</h2>
                  <p>Monthly revenue trend over the last twelve months.</p>
                </div>
              </div>

              <LineChart
                data={revenue}
                backgroundColor="hsla(155, 35%, 45%, 0.18)"
                borderColor="hsl(155, 35%, 40%)"
                label="Revenue"
                labels={months}
              />
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>DISCOUNT PERFORMANCE</span>
                  <h2>Discounts Allotted</h2>
                  <p>
                    Monthly discount allocation over the last twelve months.
                  </p>
                </div>
              </div>

              <LineChart
                data={discount}
                backgroundColor="hsla(35, 65%, 55%, 0.18)"
                borderColor="hsl(35, 65%, 45%)"
                label="Discount"
                labels={months}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Linecharts;
