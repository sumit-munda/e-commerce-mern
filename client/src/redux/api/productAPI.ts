import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AdminProductsResponse,
  AllProductsResponse,
  AllReviewsResponse,
  CategoriesResponse,
  DeleteProductRequest,
  MessageResponse,
  NewProductRequest,
  NewReviewRequest,
  ProductDetailsResponse,
  SearchProductsRequest,
  SearchProductsResponse,
  UpdateProductRequest,
} from "../../types/api.types";

export const productAPI = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/products`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["products"],
  endpoints: (builder) => ({
    latestProducts: builder.query<AllProductsResponse, void>({
      query: () => "/latest",
      providesTags: ["products"],
    }),
    allProducts: builder.query<AdminProductsResponse, string>({
      query: (id) => `/admin-products?id=${id}`,
      providesTags: ["products"],
    }),
    categories: builder.query<CategoriesResponse, string>({
      query: () => `/categories`,
      providesTags: ["products"],
    }),
    searchProducts: builder.query<
      SearchProductsResponse,
      SearchProductsRequest
    >({
      query: ({ search, sort, maxPrice, category, page }) => {
        let base = `/?search=${search}&page=${page}`;
        if (maxPrice) base += `&price=${maxPrice}`;
        if (sort) base += `&sort=${sort}`;
        if (category) base += `&category=${category}`;
        return base;
      },
      providesTags: ["products"],
    }),
    productDetails: builder.query<ProductDetailsResponse, string>({
      query: (id) => id,
      providesTags: ["products"],
    }),
    allReviews: builder.query<AllReviewsResponse, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: ["products"],
    }),
    newReview: builder.mutation<MessageResponse, NewReviewRequest>({
      query: ({ comment, rating, productId, userId }) => ({
        url: `/reviews/${productId}?id=${userId}`,
        method: "POST",
        body: {comment, rating},
        headers :{
          "Content-Type" : "application/json"
        }
      }),
      invalidatesTags: ["products"],
    }),
    newProduct: builder.mutation<MessageResponse, NewProductRequest>({
      query: ({ formData, id }) => ({
        url: `?id=${id}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["products"],
    }),
    updateProduct: builder.mutation<MessageResponse, UpdateProductRequest>({
      query: ({ formData, userId, productId }) => ({
        url: `/${productId}?id=${userId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["products"],
    }),
    deleteProduct: builder.mutation<MessageResponse, DeleteProductRequest>({
      query: ({ userId, productId }) => ({
        url: `/${productId}?id=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useLatestProductsQuery,
  useAllProductsQuery,
  useAllReviewsQuery,
  useCategoriesQuery,
  useSearchProductsQuery,
  useNewProductMutation,
  useNewReviewMutation,
  useProductDetailsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productAPI;
