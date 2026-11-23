import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

const AdminLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default AdminLayout;
