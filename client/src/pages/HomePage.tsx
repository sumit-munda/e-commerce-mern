import toast from "react-hot-toast";
import { FaHeadset } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { LuShieldCheck } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { SkeletonLoader } from "../components/Loader";
import ProductCard from "../components/ProductCard";
import {
  useCategoriesQuery,
  useLatestProductsQuery,
} from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import { CartItem } from "../types/types";

const services = [
  {
    icon: <TbTruckDelivery />,
    title: "Reliable Delivery",
    description: "Get your orders delivered right to your doorstep.",
  },
  {
    icon: <LuShieldCheck />,
    title: "Secure Payments",
    description: "Shop confidently with secure payment processing.",
  },
  {
    icon: <FaHeadset />,
    title: "Customer Support",
    description: "We're here to help whenever you need us.",
  },
];

const HomePage = () => {
  const dispatch = useDispatch();

  const {
    data: productData,
    isLoading: productsLoading,
    isError: productsError,
  } = useLatestProductsQuery();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery("");

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  const categories = categoriesData?.categories ?? [];
  const latestProducts = productData?.latestProducts ?? [];

  return (
    <>
      <div className="home-page">
        <section className="home-hero">
          <div className="home-hero__content">
            <span className="home-hero__eyebrow">WELCOME TO ECOM CITY</span>

            <h1>
              Everything you need, <span>all in one place.</span>
            </h1>

            <p>
              Discover products you love, explore greate choices, and enjoy a
              simpler online shoping experience.
            </p>

            <div className="home-hero__actions">
              <Link to="/search" className="home-hero__button">
                Explore Products <FaArrowRight />
              </Link>

              <a href="#shop-categories" className="home-hero__secondary">
                Browse Categories
              </a>
            </div>
          </div>

          <div className="home-hero__visual" aria-hidden="true">
            <div className="home-hero__visual-circle">
              <span className="home-hero__visual-label">YOUR NEXT</span>
              <strong>Great Find</strong>
              <span className="home-hero__visual-caption">Starts here.</span>
            </div>

            <div className="home-hero__visual-badge">Discover. Shop. Enjoy</div>
          </div>
        </section>

        <section className="home-categories" id="shop-categories">
          <div className="home-section-heading">
            <div>
              <span>EXPLORE OUR COLLECTION</span>
              <h2>Shop by Category</h2>
            </div>

            <Link to="/search" className="home-section-link">
              View all <FaArrowRight />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="home-categories__list">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonLoader
                  key={index}
                  width="100%"
                  height="4rem"
                  length={1}
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="home-categories__list">
              {categories.map((category) => (
                <NavLink
                  key={category}
                  to={`/search?category=${encodeURIComponent(category)}`}
                  className="home-category-card"
                >
                  <span>
                    {category.replace(/\b\w/g, (letter) =>
                      letter.toUpperCase(),
                    )}
                  </span>
                  <FaArrowRight />
                </NavLink>
              ))}
            </div>
          ) : (
            <p className="home-empty-message">
              No categories available right now.
            </p>
          )}
        </section>

        <section className="home-products">
          <div className="home-section-heading">
            <div>
              <span>FRESH FINDS FOR YOU</span>
              <h2>Latest Products</h2>
            </div>

            <Link to="/search" className="home-section-link">
              View all products <FaArrowRight />
            </Link>
          </div>

          {productsError ? (
            <p className="home-empty-message">
              We couldn't load products. Please try again later.
            </p>
          ) : productsLoading ? (
            <div className="home-products__grid">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="home-product-skeleton">
                  <SkeletonLoader width="100%" height="15rem" length={1} />
                  <SkeletonLoader width="80%" height="1.5rem" length={2} />
                </div>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="home-products__grid">
              {latestProducts.map((product) => (
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
            <p className="home-empty-message">No products found.</p>
          )}
        </section>

        <div className="home-benefits">
          <div className="home-section-heading">
            <div>
              <span>SHOP WITH CONFIDENCE</span>
              <h2>A Better Shopping Experience</h2>
            </div>
          </div>

          <div className="home-benefits__grid">
            {services.map((service) => (
              <article className="home-benefit-card" key={service.title}>
                <div className="home-benefit-card__icon">{service.icon}</div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
