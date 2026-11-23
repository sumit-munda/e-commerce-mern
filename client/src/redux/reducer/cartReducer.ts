import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/reducer.types";
import { CartItem, ShippingInfo } from "../../types/types";

export const CART_STORAGE_KEY = "ecom-city-cart";

const emptyState: CartReducerInitialState = {
  loading: false,
  cartItems: [],
  subtotal: 0,
  tax: 0,
  shippingCharges: 0,
  discount: 0,
  total: 0,
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
};

const getInitialState = (): CartReducerInitialState => {
  try {
    if (typeof window === "undefined") return emptyState;

    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return emptyState;

    const parsed = JSON.parse(savedCart) as {
      cartItems?: CartItem[];
      shippingInfo?: ShippingInfo;
    };

    const cartItems = Array.isArray(parsed.cartItems)
      ? parsed.cartItems.filter(
          (item) =>
            item &&
            typeof item.productId === "string" &&
            typeof item.name === "string" &&
            typeof item.photo === "string" &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            Number.isInteger(item.stock) &&
            item.stock >= item.quantity,
        )
      : [];

    const shippingInfo = {
      ...emptyState.shippingInfo,
      ...(parsed.shippingInfo ?? {}),
    };

    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const shippingCharges =
      cartItems.length === 0 ? 0 : subtotal > 1000 ? 0 : 200;

    const tax = Math.round(subtotal * 0.18);

    return {
      ...emptyState,
      cartItems,
      shippingInfo,
      subtotal,
      tax,
      shippingCharges,
      total: subtotal + tax + shippingCharges,
    };
  } catch {
    return emptyState;
  }
};

const initialState = getInitialState();

export const cartReducer = createSlice({
  name: "cartReducer",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.loading = true;

      const index = state.cartItems.findIndex(
        (i) => i.productId === action.payload.productId,
      );

      if (index !== -1) state.cartItems[index] = action.payload;
      else state.cartItems.push(action.payload);

      state.loading = false;
    },

    removeCartItem: (state, action: PayloadAction<string>) => {
      state.loading = true;

      state.cartItems = state.cartItems.filter(
        (i) => i.productId !== action.payload,
      );

      state.loading = false;
    },

    calculatePrice: (state) => {
      const subtotal = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      state.subtotal = subtotal;
      state.shippingCharges = state.subtotal > 1000 ? 0 : 200;
      state.tax = Math.round(state.subtotal * 0.18);
      state.total =
        state.subtotal + state.tax + state.shippingCharges - state.discount;
    },

    discountApplied: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },

    saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
      state.shippingInfo = action.payload;
    },
    resetCart: () => emptyState,
  },
});

export const {
  addToCart,
  removeCartItem,
  calculatePrice,
  discountApplied,
  saveShippingInfo,
  resetCart,
} = cartReducer.actions;
