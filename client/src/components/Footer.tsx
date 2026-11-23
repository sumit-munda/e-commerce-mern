import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__main">
          <div className="site-footer__brand-section">
            <Link to="/" className="site-footer__brand">
              Ecom<span>City</span>
            </Link>

            <p>
              Discover products, shop with ease, and enjoy a simpler online
              shopping experience.
            </p>

            <Link to="/search" className="site-footer__shop-link">
              Explore products <FaArrowRight />
            </Link>
          </div>

          <div className="site-footer__column">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/search">Shop Products</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>

          <div className="site-footer__column">
            <h3>Your Account</h3>
            <Link to="/login">Sign In</Link>
            <Link to="/orders">My Orders</Link>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} Ecom City. All rights reserved.</p>
          <p>Designed for a simpler shopping experience.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
