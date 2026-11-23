import { onAuthStateChanged } from "firebase/auth";
import { Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import { auth } from "./firebase";
import { getUser } from "./redux/api/userAPI";
import { userExist, userNotExist } from "./redux/reducer/userReducer";
import { RootState } from "./redux/store";
import "./styles/App.scss";
import router from "./routes/router";
import { RouterProvider } from "react-router-dom";

const App = () => {
  const { loading } = useSelector((state: RootState) => state.userReducer);

  const dispatch = useDispatch();

  useEffect(() => {
    let isActive = true;
    let authStateVersion = 0;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentVersion = ++authStateVersion;

      if (!firebaseUser) {
        dispatch(userNotExist());
        return;
      }

      try {
        const data = await getUser(firebaseUser.uid);

        if (isActive && currentVersion === authStateVersion) {
          dispatch(userExist(data.user));
        }
      } catch (error) {
        console.error("Unable to load authenticated user:", error);

        if (isActive && currentVersion === authStateVersion) {
          dispatch(userNotExist());
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>

        <Toaster
          position="top-right"
          containerStyle={{
            top: 88,
            right: 16,
          }}
        />
      </ErrorBoundary>
    </>
  );
};

export default App;
