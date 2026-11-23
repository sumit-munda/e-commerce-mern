import { useEffect, useState } from "react";
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaHome,
  FaShoppingBag,
  FaTimes,
  FaUsers,
  FaBars,
  FaReceipt,
} from "react-icons/fa";
import { MdDashboard, MdDiscount } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";

type NavItem = {
  name: string;
  url: string;
  icon: IconType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", url: "/admin/dashboard", icon: MdDashboard }],
  },
  {
    title: "Management",
    items: [
      { name: "Products", url: "/admin/products", icon: FaShoppingBag },
      { name: "Customers", url: "/admin/customers", icon: FaUsers },
      { name: "Transactions", url: "/admin/transactions", icon: FaReceipt },
      { name: "Discounts", url: "/admin/discounts", icon: MdDiscount },
    ],
  },
  {
    title: "Analytics",
    items: [
      { name: "Bar Charts", url: "/admin/charts/bar", icon: FaChartBar },
      { name: "Pie Charts", url: "/admin/charts/pie", icon: FaChartPie },
      { name: "Line Charts", url: "/admin/charts/line", icon: FaChartLine },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 1100;
      setIsMobile(mobile);

      if (!mobile) {
        setIsOpen(false);
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (url: string) => {
    if (url === "/admin/dashboard") {
      return location.pathname === url;
    }

    return (
      location.pathname === url ||
      location.pathname.startsWith(`${url}/`) ||
      (url === "/admin/products" &&
        location.pathname.startsWith("/admin/products/")) ||
      (url === "/admin/discounts" &&
        location.pathname.startsWith("/admin/discounts/")) ||
      (url === "/admin/transactions" &&
        location.pathname.startsWith("/admin/transactions/"))
    );
  };

  const sidebarContent = (
    <>
      <div className="admin-sidebar__brand">
        <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
          <span className="admin-sidebar__brand-icon">
            <FaShoppingBag />
          </span>
          <span>
            <strong>EcomCity</strong>
            <small>Admin workspace</small>
          </span>
        </Link>

        {isMobile && (
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {navGroups.map((group) => (
          <section className="admin-sidebar__group" key={group.title}>
            <h2>{group.title}</h2>

            <ul>
              {group.items.map(({ name, url, icon: Icon }) => (
                <li key={url}>
                  <Link
                    to={url}
                    onClick={() => setIsOpen(false)}
                    className={
                      isActive(url)
                        ? "admin-sidebar__link is-active"
                        : "admin-sidebar__link"
                    }
                    aria-current={isActive(url) ? "page" : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <Link to="/" className="admin-sidebar__back">
          <FaHome />
          <span>Back to storefront</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className="admin-sidebar__menu"
          onClick={() => setIsOpen(true)}
          aria-label="Open admin navigation"
          aria-expanded={isOpen}
          aria-controls="admin-sidebar-panel"
        >
          <FaBars />
        </button>
      )}

      {isMobile && isOpen && (
        <button
          type="button"
          className="admin-sidebar__backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="admin-sidebar-panel"
        className={`admin-sidebar ${isMobile ? "is-mobile" : ""} ${
          isOpen ? "is-open" : ""
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
