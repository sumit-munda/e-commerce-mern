import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ScrollToTop from "../components/ScrollToTop";
import type { RootState } from "../redux/store";

const MainLayout = () => {
  const user = useSelector((state: RootState) => state.userReducer.user);

  return (
    <>
      <ScrollToTop />
      <Header user={user} />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
