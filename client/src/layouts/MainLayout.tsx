import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const user = { _id: 5, name: "VINOD", role: "admin" };

const MainLayout = () => {
  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
};

export default MainLayout;
