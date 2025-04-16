import React from "react";
import { NavLink } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const addToCartHandler = () => {};
  return (
    <div className="home">
      <section></section>
      <h1>
        latest Products
        <NavLink to="/search" className="findmore">
          More
        </NavLink>
      </h1>
      <main>
        <ProductCard
          productId="asdfgh"
          name="Macbook"
          price={4545}
          stock={432}
          handler={addToCartHandler}
          photo="https://d1b5h9psu9yexj.cloudfront.net/69465/Apple-MacBook-Air--13-inch--M4--2025-_20250310-210408_full.jpeg"
        />
      </main>
      Home Page
    </div>
  );
};

export default HomePage;
