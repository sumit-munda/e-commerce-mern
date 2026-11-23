import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { SkeletonLoader } from "../components/Loader";
import ProductCard from "../components/ProductCard";
import {
  useCategoriesQuery,
  useSearchProductsQuery,
} from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import { CustomError } from "../types/api.types";
import { CartItem } from "../types/types";
import { useSearchParams } from "react-router-dom";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";

  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    isError,
    error,
  } = useCategoriesQuery("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState(urlCategory);
  const [page, setPage] = useState(1);

  const {
    isLoading: productsLoading,
    data: searchedData,
    isError: productIsError,
    error: productError,
  } = useSearchProductsQuery({
    search,
    sort,
    maxPrice,
    category,
    page,
  });

  const dispatch = useDispatch();

  // Keep category synchronized with homepage/category URL navigation.
  useEffect(() => {
    setCategory(urlCategory);
    setPage(1);
  }, [urlCategory]);

  // Show errors through effects instead of triggering toasts during render.
  useEffect(() => {
    if (isError) {
      const err = error as CustomError | undefined;
      toast.error(err?.data?.message || "Unable to load categories.");
    }
  }, [isError, error]);

  useEffect(() => {
    if (productIsError) {
      const err = productError as CustomError | undefined;
      toast.error(err?.data?.message || "Unable to load products.");
    }
  }, [productIsError, productError]);

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (value) {
        nextParams.set("category", value);
      } else {
        nextParams.delete("category");
      }

      return nextParams;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSort("");
    setMaxPrice(100000);
    setCategory("");
    setPage(1);

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete("category");
      return nextParams;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handlePriceChange = (value: number) => {
    setMaxPrice(value);
    setPage(1);
  };

  const totalPages = searchedData?.totalPages ?? 1;
  const hasProducts = (searchedData?.allProducts.length ?? 0) > 0;

  return (
    <div className="product-search-page">
      <aside>
        <div className="search-filter-heading">
          <h2>Filters</h2>
          <button type="button" onClick={clearFilters}>
            Clear all
          </button>
        </div>

        <div className="search-filter-group">
          <label htmlFor="product-sort">Sort by</label>
          <select
            name="sort"
            id="product-sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="">Recommended</option>
            <option value="asc">Price: Low to High</option>
            <option value="dsc">Price: High to Low</option>
          </select>
        </div>

        <div className="search-filter-group">
          <label htmlFor="max-price">
            Maximum price: ₹{maxPrice.toLocaleString("en-IN")}
          </label>
          <input
            type="range"
            id="max-price"
            name="maxPrice"
            min={100}
            max={100000}
            step={100}
            value={maxPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
          />
          <div className="price-range-labels">
            <span>₹100</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        <div className="search-filter-group">
          <label htmlFor="product-category">Category</label>
          <select
            name="category"
            id="product-category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={loadingCategories}
          >
            <option value="">All Categories</option>

            {categoriesResponse?.categories.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <main>
        <div className="search-results-heading">
          <div>
            <span className="search-eyebrow">OUR COLLECTION</span>
            <h1>Explore Products</h1>
            <p>Find the products you're looking for.</p>
          </div>
        </div>

        <div className="search-input-wrapper">
          <input
            type="search"
            id="product-search"
            placeholder="Search products by name..."
            aria-label="Search products by name"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {productsLoading ? (
          <SkeletonLoader length={8} />
        ) : hasProducts ? (
          <div className="search-product-list">
            {searchedData?.allProducts.map((product) => (
              <ProductCard
                key={product._id}
                productId={product._id}
                name={product.name}
                price={product.price}
                stock={product.stock}
                photos={product.photos}
                handler={addToCartHandler}
              />
            ))}
          </div>
        ) : (
          !productIsError && (
            <div className="search-empty-state">
              <h2>No products found</h2>
              <p>Try changing your search term or adjusting the filters.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )
        )}

        {searchedData && searchedData.totalPages > 1 && (
          <nav className="search-navigation" aria-label="Product pages">
            <button
              type="button"
              disabled={page <= 1 || productsLoading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || productsLoading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default ShopPage;
