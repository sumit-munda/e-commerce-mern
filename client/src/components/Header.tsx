import { signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaShoppingBag,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase";
import type { User } from "../types/types";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

interface PropsType {
  user: User | null;
}

const Header = ({ user }: PropsType) => {
  const [isOpen, setIsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const cartCount = useSelector((state: RootState) =>
    state.cartReducer.cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      toast.success("Signed out successfully");
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink
          to="/"
          className="site-header__brand"
          aria-label="Ecom City home"
        >
          Ecom<span>City</span>
        </NavLink>

        <nav className="site-header__nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/search">Shop</NavLink>
        </nav>

        <div className="site-header__actions">
          <NavLink
            to="/search"
            className="site-header__icon-link"
            aria-label="Search products"
          >
            <FaSearch />
          </NavLink>

          <NavLink
            to="/cart"
            className="site-header__icon-link site-header__cart-link"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <FaShoppingBag />

            {cartCount > 0 && (
              <span className="site-header__cart-count" aria-live="polite">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </NavLink>

          {user?._id ? (
            <div className="site-header__account" ref={accountRef}>
              <button
                type="button"
                className="site-header__account-button"
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <FaUser />
              </button>

              {isOpen && (
                <div className="site-header__dropdown">
                  {user.role === "admin" && (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </NavLink>
                  )}

                  <NavLink to="/orders" onClick={() => setIsOpen(false)}>
                    My Orders
                  </NavLink>

                  <button type="button" onClick={logoutHandler}>
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="site-header__signin"
              aria-label="Sign in"
            >
              <FaSignInAlt />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
