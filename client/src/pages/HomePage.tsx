import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { SkeletonLoader } from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { useLatestProductsQuery } from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import { CartItem } from "../types/types";

const HomePage = () => {
  const { data, isLoading, isError } = useLatestProductsQuery();

  const dispatch = useDispatch();

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of stock");
    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  if (isError) toast.error("Cannot fetch the products");

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
        {isLoading ? (
          <SkeletonLoader width="80vw" />
        ) : data?.latestProducts && data.latestProducts.length > 0 ? (
          data.latestProducts.map((i) => (
            <ProductCard
              key={i._id}
              productId={i._id}
              name={i.name}
              price={i.price}
              stock={i.stock}
              handler={addToCartHandler}
              photo={i.photo}
            />
          ))
        ) : (
          <p>No Products Found</p>
        )}
      </main>
      Home Page
    </div>
  );
};

export default HomePage;
