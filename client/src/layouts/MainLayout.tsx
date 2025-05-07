import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { User } from "../types/types";
import Footer from "../components/Footer";

interface MainLayoutProps {
  user: User | null;
}

const MainLayout = ({ user }: MainLayoutProps) => {
  return (
    <>
      <Header user={user} />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
