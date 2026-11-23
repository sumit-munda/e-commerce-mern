import { BiMaleFemale } from "react-icons/bi";
import { FaBoxOpen, FaShoppingCart, FaUsers, FaWallet } from "react-icons/fa";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { BarChart, DoughnutChart } from "../../components/admin/Charts";
import Table from "../../components/admin/DashboardTable";
import { SkeletonLoader } from "../../components/Loader";
import { useStatsQuery } from "../../redux/api/dashboardAPI";
import type { RootState } from "../../redux/store";
import { getLastMonths } from "../../utils/features";

const { last6Months: months } = getLastMonths();

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const [avatarFailed, setAvatarFailed] = useState(false);

  const avatarName = user?.name?.trim() || "Admin";

  const initials = avatarName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const avatarColors = [
    "#52745b",
    "#526b91",
    "#916b52",
    "#80639a",
    "#397c7c",
    "#a16b78",
  ];

  const avatarColor =
    avatarColors[
      [...avatarName].reduce((hash, char) => hash + char.charCodeAt(0), 0) %
        avatarColors.length
    ];

  const { data, isLoading, isError } = useStatsQuery(user?._id ?? "", {
    skip: !user?._id,
  });

  const stats = data?.stats;

  if (isError) return <Navigate to="/" replace />;

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="dashboard">
        {isLoading || !stats ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            <header className="dashboard-header">
              <div className="dashboard-heading">
                <span>OVERVIEW</span>
                <h1>Dashboard</h1>
                <p>
                  Welcome back, {user?.name?.split(" ")[0] || "Admin"}. Here's
                  what's happening with your store.
                </p>
              </div>

              <div className="dashboard-profile">
                <div>
                  <span>Signed in as</span>
                  <strong>{user?.name || "Administrator"}</strong>
                </div>

                {user?.photo && !avatarFailed ? (
                  <img
                    src={user?.photo}
                    alt={avatarName}
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <div
                    className="dashboard-avatar"
                    role="img"
                    aria-label={avatarName}
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </header>

            <section className="dashboard-section">
              <div className="dashboard-section__heading">
                <div>
                  <h2>Store performance</h2>
                  <p>Your overall store statistics</p>
                </div>
              </div>

              <div className="widget-container">
                <WidgetItem
                  heading="Total Revenue"
                  value={stats.count.revenue}
                  percent={stats.changePercentage.revenue}
                  icon={FaWallet}
                  formatValue={currencyFormatter.format}
                />

                <WidgetItem
                  heading="Total Customers"
                  value={stats.count.user}
                  percent={stats.changePercentage.user}
                  icon={FaUsers}
                />

                <WidgetItem
                  heading="Transactions"
                  value={stats.count.order}
                  percent={stats.changePercentage.order}
                  icon={FaShoppingCart}
                />

                <WidgetItem
                  heading="Products"
                  value={stats.count.product}
                  percent={stats.changePercentage.product}
                  icon={FaBoxOpen}
                />
              </div>
            </section>

            <section className="dashboard-section">
              <div className="dashboard-section__heading">
                <div>
                  <h2>Analytics</h2>
                  <p>Revenue trends and product distribution</p>
                </div>
              </div>

              <div className="graph-container">
                <div className="revenue-chart">
                  <h3>Revenue & Transactions</h3>

                  <BarChart
                    labels={months}
                    data_1={stats.chart.revenue}
                    data_2={stats.chart.order}
                    title_1="Revenue"
                    title_2="Transactions"
                    bgColor_1="#52745b"
                    bgColor_2="#b7c9b9"
                  />
                </div>

                <div className="dashboard-categories">
                  <h3>Inventory distribution</h3>

                  <div>
                    {stats.categoryCount.map((item) => {
                      const [heading, value] = Object.entries(item)[0];

                      return (
                        <CategoryItem
                          key={heading}
                          heading={heading}
                          value={value}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="dashboard-section__heading">
                <div>
                  <h2>Customers & transactions</h2>
                  <p>Customer demographics and recent activity</p>
                </div>
              </div>

              <div className="transaction-container">
                <div className="gender-chart">
                  <h3>Customer gender ratio</h3>
                  <p>Based on customers who provided gender</p>

                  <DoughnutChart
                    labels={["Female", "Male"]}
                    data={[stats.userRatio.female, stats.userRatio.male]}
                    backgroundColor={["#d99aaf", "#52745b"]}
                    cutout={75}
                  />

                  <div className="gender-chart__footer">
                    <BiMaleFemale />
                    <span>
                      {stats.userRatio.female + stats.userRatio.male} customers
                    </span>
                  </div>
                </div>

                <div className="dashboard-transactions">
                  <Table data={stats.latestTransactions} />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

import type { IconType } from "react-icons";
import { useState } from "react";

interface WidgetItemProps {
  heading: string;
  value: number;
  percent: number;
  icon: IconType;
  formatValue?: (value: number) => string;
}

const WidgetItem = ({
  heading,
  value,
  percent,
  icon: Icon,
  formatValue,
}: WidgetItemProps) => {
  const isPositive = percent > 0;
  const isNeutral = percent === 0;
  const displayedPercent = Math.min(Math.abs(percent), 9999);
  const progress = Math.min(Math.abs(percent), 100);

  return (
    <article className="widget">
      <div className="widget__top">
        <span className="widget__icon">
          <Icon />
        </span>

        <span className="widget__comparison">
          {isNeutral ? (
            "No change"
          ) : (
            <>
              {isPositive ? <HiTrendingUp /> : <HiTrendingDown />}
              {isPositive ? "+" : "-"}
              {displayedPercent.toFixed(1)}%
            </>
          )}
        </span>
      </div>

      <div className="widget__info">
        <p>{heading}</p>
        <h3>
          {formatValue ? formatValue(value) : value.toLocaleString("en-IN")}
        </h3>
      </div>

      <div className="widget__progress">
        <div
          className={
            isPositive
              ? "widget__progress-fill is-positive"
              : "widget__progress-fill"
          }
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="widget__caption">Compared with previous month</span>
    </article>
  );
};

interface CategoryItemProps {
  value: number;
  heading: string;
}

const CategoryItem = ({ value, heading }: CategoryItemProps) => (
  <div className="category-item">
    <div className="category-item__info">
      <h4>{heading}</h4>
      <span>{value}%</span>
    </div>

    <div className="category-item__track">
      <div
        className="category-item__fill"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />
    </div>
  </div>
);

export default Dashboard;
