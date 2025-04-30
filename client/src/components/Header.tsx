import { NavLink } from "react-router-dom";
import {
  FaSearch,
  FaShoppingBag,
  FaSignInAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";
import { User } from "../types/types";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import ErrorBoundary from "./ErrorBoundary";

interface PropsType {
  user: User | null; // * user type, OBJECT of type User or null
}

const Header = ({ user }: PropsType) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const logoutHandler = async () => {
    try {
        await signOut(auth);
      toast.success("Sign Out Successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Sign Out Fail");
    }
  };

  return (
    <ErrorBoundary>
      <nav className="header">
        <NavLink onClick={() => setIsOpen(false)} to="/">
          HOME
        </NavLink>
        <NavLink onClick={() => setIsOpen(false)} to="/search">
          <FaSearch />
        </NavLink>
        <NavLink onClick={() => setIsOpen(false)} to="/cart">
          <FaShoppingBag />
        </NavLink>

        {user?._id ? (
          <>
            <button onClick={() => setIsOpen((prev) => !prev)}>
              <FaUser />
            </button>
            <dialog open={isOpen}>
              <div>
                {user.role === "admin" && (
                  <NavLink
                    onClick={() => setIsOpen(false)}
                    to="/admin/dashboard"
                  >
                    Admin
                  </NavLink>
                )}

                <NavLink onClick={() => setIsOpen(false)} to="/orders">
                  Orders
                </NavLink>
                <button onClick={logoutHandler}>
                  <FaSignOutAlt />
                </button>
              </div>
            </dialog>
          </>
        ) : (
          <NavLink to="/login">
            <FaSignInAlt />
          </NavLink>
        )}
      </nav>
    </ErrorBoundary>
  );
};

export default Header;
