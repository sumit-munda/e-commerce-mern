import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaBoxOpen, FaShieldAlt, FaTruck } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getUser, useLoginMutation } from "../redux/api/userAPI";
import { userExist } from "../redux/reducer/userReducer";
import { MessageResponse } from "../types/api.types";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const dispatch = useDispatch();

  const loginHandler = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      if (!user.displayName || !user.email || !user.photoURL) {
        toast.error("Unable to retrieve your Google profile.");
        return;
      }

      const res = await login({
        _id: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });

      if ("data" in res) {
        const data = await getUser(user.uid);

        dispatch(userExist(data.user));

        toast.success(res.data?.message || "Signed in successfully");

        const from = (
          location.state as { from?: { pathname?: string } } | null
        )?.from?.pathname;

        navigate(from || "/", { replace: true });
      } else {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as MessageResponse)?.message;

        toast.error(message || "Unable to sign in. Please try again.");
      }
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const isBusy = isSigningIn || isLoading;

  return (
    <main className="login-page">
      <div className="login-page__container">
        <section className="login-page__welcome">
          <span className="login-page__eyebrow">
            WELCOME TO ECOM CITY
          </span>

          <h1>
            Shopping made
            <br />
            <span>simple and seamless.</span>
          </h1>

          <p className="login-page__description">
            Your everyday shopping destination. Discover products,
            enjoy a smooth checkout and keep track of every order
            from one place.
          </p>

          <div className="login-page__benefits">
            <div className="login-page__benefit">
              <span className="login-page__benefit-icon">
                <FaBoxOpen />
              </span>
              <div>
                <strong>Everything in one place</strong>
                <p>Browse and manage your purchases easily.</p>
              </div>
            </div>

            <div className="login-page__benefit">
              <span className="login-page__benefit-icon">
                <FaShieldAlt />
              </span>
              <div>
                <strong>Secure checkout</strong>
                <p>A convenient and protected shopping experience.</p>
              </div>
            </div>

            <div className="login-page__benefit">
              <span className="login-page__benefit-icon">
                <FaTruck />
              </span>
              <div>
                <strong>Order tracking</strong>
                <p>Keep up with your orders and delivery status.</p>
              </div>
            </div>
          </div>

          <div className="login-page__decoration" aria-hidden="true">
            <div className="login-page__decoration-circle" />
            <div className="login-page__decoration-card">
              <FaBoxOpen />
              <span>YOUR SHOPPING JOURNEY</span>
            </div>
          </div>
        </section>

        <section className="login-form" aria-label="Sign in">
          <div className="login-form__heading">
            <span className="login-form__icon">
              <FaShieldAlt />
            </span>

            <h2>Get Started</h2>

            <p>Sign in or create an account to get started.</p>
          </div>

          <button
            type="button"
            className="login-form__google"
            onClick={loginHandler}
            disabled={isBusy}
            aria-busy={isBusy}
          >
            <FcGoogle />
            <span>
              {isBusy ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <div className="login-form__divider">
            <span>QUICK & SECURE SIGN IN</span>
          </div>

          <p className="login-form__note">
            By continuing, you can access your cart, manage your
            orders and enjoy your shopping experience.
          </p>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;