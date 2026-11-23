import { Link } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import { FaArrowLeft, FaShoppingBag } from "react-icons/fa";

const NotFoundPage = () => {
  return (
    <main className="not-found">
      <div className="not-found__content">
        <span className="not-found__icon">
          <MdErrorOutline />
        </span>

        <span className="not-found__eyebrow">ERROR 404</span>

        <h1>
          Page not <span>found.</span>
        </h1>

        <p>
          The page you're looking for doesn't exist, may have been moved,
          or the link might be incorrect.
        </p>

        <div className="not-found__actions">
          <Link to="/" className="not-found__home">
            <FaArrowLeft />
            Back to Home
          </Link>

          <Link to="/search" className="not-found__shop">
            <FaShoppingBag />
            Explore Products
          </Link>
        </div>

        <span className="not-found__reference">
          EcomCity · Your everyday shopping destination
        </span>
      </div>
    </main>
  );
};

export default NotFoundPage;