import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { User } from "../types/types";

interface MainLayoutProps {
  user: User | null;
}

const MainLayout = ({ user }: MainLayoutProps) => {
  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
};

export default MainLayout;
