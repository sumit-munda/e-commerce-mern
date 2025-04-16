import React, { ChangeEvent, useState } from "react";
import ProductCard from "../components/ProductCard";

const SearchPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    sort: "",
    maxPrice: 100000,
    category: "",
    page: 1,
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "range" || type === "number" ? Number(value) : value,
    }));
  };

  const addToCartHandler = () => {};

  const isPrevPage = filters.page > 1;
  const isNextPage = filters.page < 4;

  return (
    <div className="product-search-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select name="sort" value={filters.sort} onChange={changeHandler}>
            <option value="">None</option>
            <option value="asc">Price (Low to High)</option>
            <option value="dsc">Price (High to Low)</option>
          </select>
        </div>
        <div>
          <h4>Max Price: {filters.maxPrice || ""}</h4>
          <h4>Sort</h4>
          <input
            name="maxPrice"
            type="range"
            min={100}
            max={100000}
            value={filters.maxPrice}
            onChange={changeHandler}
          />
        </div>
        <div>
          <h4>Category</h4>
          <select
            name="category"
            value={filters.category}
            onChange={changeHandler}
          >
            <option value="">All</option>
            <option value="">Sample1</option>
            <option value="">Sample2</option>
          </select>
        </div>
      </aside>
      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.search}
          onChange={changeHandler}
        />

        <div className="search-product-list">
          <ProductCard
            productId="asdfgh"
            name="Macbook"
            price={4545}
            stock={432}
            handler={addToCartHandler}
            photo="https://d1b5h9psu9yexj.cloudfront.net/69465/Apple-MacBook-Air--13-inch--M4--2025-_20250310-210408_full.jpeg"
          />
        </div>
        <article>
          <button
            disabled={!isPrevPage}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
          >
            Prev
          </button>
          <span>
            {filters.page} of {4}
          </span>
          <button
            disabled={!isNextPage}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </button>
        </article>
      </main>
    </div>
  );
};

export default SearchPage;
