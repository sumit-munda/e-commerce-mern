import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
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
