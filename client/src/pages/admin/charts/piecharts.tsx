import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import { DoughnutChart, PieChart } from "../../../components/admin/Charts";
import { SkeletonLoader } from "../../../components/Loader";
import { usePieQuery } from "../../../redux/api/dashboardAPI";
import { RootState } from "../../../redux/store";
import { CustomError } from "../../../types/api.types";

const PieCharts = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    data,
    isLoading,
    isError,
    error,
  } = usePieQuery(user?._id ?? "", {
    skip: !user?._id,
  });

  const charts = data?.charts;

  const order = charts?.orderFullfillment ?? {
    processing: 0,
    shipped: 0,
    delivered: 0,
  };

  const categories = charts?.productCategories ?? [];

  const ageGroup = charts?.usersAgeGroup ?? {
    teen: 0,
    adult: 0,
    old: 0,
  };

  const adminCustomer = charts?.adminCustomer ?? {
    admin: 0,
    customer: 0,
  };

  const revenue = charts?.revenueDistribution ?? {
    marketingCost: 0,
    discount: 0,
    burnt: 0,
    productionCost: 0,
    netMargin: 0,
  };

  const stock = charts?.stockAvailability ?? {
    inStock: 0,
    outOfStock: 0,
  };

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
          <h1>Pie & Doughnut Charts</h1>
          <p>
            Explore order fulfillment, inventory, customer demographics,
            and revenue distribution.
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
          <div className="chart-grid">
            <section>
              <div className="chart-section-heading">
                <div>
                  <span>ORDERS</span>
                  <h2>Order Fulfillment</h2>
                  <p>Distribution of orders across their current statuses.</p>
                </div>
              </div>

              <div>
                <PieChart
                  labels={["Processing", "Shipped", "Delivered"]}
                  data={[
                    order.processing,
                    order.shipped,
                    order.delivered,
                  ]}
                  backgroundColor={[
                    "hsl(35, 75%, 75%)",
                    "hsl(145, 25%, 65%)",
                    "hsl(137, 20%, 42%)",
                  ]}
                  offset={[0, 0, 15]}
                />
              </div>
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>CATALOG</span>
                  <h2>Product Categories</h2>
                  <p>How products are distributed across categories.</p>
                </div>
              </div>

              <div>
                <DoughnutChart
                  labels={categories.map((item) => Object.keys(item)[0])}
                  data={categories.map((item) => Object.values(item)[0])}
                  backgroundColor={categories.map(
                    (_, index) =>
                      `hsl(${135 + index * 24}, 25%, ${45 + (index % 3) * 10}%)`
                  )}
                  legends={true}
                  offset={categories.map(() => 0)}
                />
              </div>
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>INVENTORY</span>
                  <h2>Stock Availability</h2>
                  <p>Comparison of available and out-of-stock products.</p>
                </div>
              </div>

              <div>
                <DoughnutChart
                  labels={["In Stock", "Out of Stock"]}
                  data={[stock.inStock, stock.outOfStock]}
                  backgroundColor={[
                    "hsl(137, 20%, 42%)",
                    "hsl(0, 55%, 65%)",
                  ]}
                  legends={true}
                  offset={[0, 10]}
                  cutout="70%"
                />
              </div>
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>FINANCIALS</span>
                  <h2>Revenue Distribution</h2>
                  <p>Breakdown of the financial components reported by the dashboard.</p>
                </div>
              </div>

              <div>
                <DoughnutChart
                  labels={[
                    "Marketing Cost",
                    "Discount",
                    "Burnt",
                    "Production Cost",
                    "Net Margin",
                  ]}
                  data={[
                    revenue.marketingCost,
                    revenue.discount,
                    revenue.burnt,
                    revenue.productionCost,
                    revenue.netMargin,
                  ]}
                  backgroundColor={[
                    "hsl(137, 20%, 42%)",
                    "hsl(35, 75%, 65%)",
                    "hsl(0, 55%, 65%)",
                    "hsl(145, 25%, 65%)",
                    "hsl(155, 30%, 35%)",
                  ]}
                  legends={true}
                  offset={[0, 0, 0, 0, 10]}
                />
              </div>
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>CUSTOMERS</span>
                  <h2>User Age Groups</h2>
                  <p>Age distribution based on users who provided their date of birth.</p>
                </div>
              </div>

              <div>
                <PieChart
                  labels={[
                    "Teenagers (Below 20)",
                    "Adults (20–40)",
                    "Older (Above 40)",
                  ]}
                  data={[
                    ageGroup.teen,
                    ageGroup.adult,
                    ageGroup.old,
                  ]}
                  backgroundColor={[
                    "hsl(35, 75%, 75%)",
                    "hsl(145, 25%, 65%)",
                    "hsl(137, 20%, 42%)",
                  ]}
                  offset={[0, 0, 10]}
                />
              </div>
            </section>

            <section>
              <div className="chart-section-heading">
                <div>
                  <span>USER BASE</span>
                  <h2>Admins & Customers</h2>
                  <p>Distribution of registered accounts by role.</p>
                </div>
              </div>

              <div>
                <DoughnutChart
                  labels={["Admins", "Customers"]}
                  data={[
                    adminCustomer.admin,
                    adminCustomer.customer,
                  ]}
                  backgroundColor={[
                    "hsl(137, 20%, 42%)",
                    "hsl(145, 25%, 75%)",
                  ]}
                  legends={true}
                  offset={[0, 10]}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default PieCharts;
