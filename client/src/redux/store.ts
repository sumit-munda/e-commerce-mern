import { configureStore } from "@reduxjs/toolkit";
import { productAPI } from "./api/productAPI";
import { userAPI } from "./api/userAPI";
import { userReducer } from "./reducer/userReducer";
import { CART_STORAGE_KEY, cartReducer } from "./reducer/cartReducer";
import { orderAPI } from "./api/orderAPI";
import { dashboardAPI } from "./api/dashboardAPI";

// export const server = "https://backend.bigbug.in";
export const server = "http://localhost:5000";

export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [userReducer.name]: userReducer.reducer,
    [cartReducer.name]: cartReducer.reducer,
    [orderAPI.reducerPath]: orderAPI.reducer,
    [dashboardAPI.reducerPath]: dashboardAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userAPI.middleware)
      .concat(productAPI.middleware)
      .concat(orderAPI.middleware)
      .concat(dashboardAPI.middleware),
});

// Persist cart items and shipping information after every Redux update.
if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const { cartItems, shippingInfo } = store.getState().cartReducer;

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ cartItems, shippingInfo }),
      );
    } catch (error) {
      console.error("Unable to persist cart:", error);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
