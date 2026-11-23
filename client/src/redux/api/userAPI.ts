import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import {
  AllUsersResponse,
  DeleteUserRequest,
  MessageResponse,
  UserResponse,
} from "../../types/api.types";
import { LoginRequest } from "../../types/types";

// const server = "https://backend.bigbug.in";
const server = "http://localhost:5000";

export const userAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/users`,
  }),

  tagTypes: ["users"],
  endpoints: (builder) => ({
    login: builder.mutation<MessageResponse, LoginRequest>({
      query: (user) => ({
        url: "/",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),
    allUsers: builder.query<AllUsersResponse, string>({
      query: (id) => `?id=${id}`,
      providesTags: ["users"],
    }),
    deleteUser: builder.mutation<MessageResponse, DeleteUserRequest>({
      query: ({ userId, adminUserId }) => ({
        url: `/${userId}?id=${adminUserId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const getUser = async (id: string) => {
    const { data }: { data: UserResponse } = await axios.get(
      `${server}/api/v1/users/${id}`
    );
    return data;
};

export const { useLoginMutation, useAllUsersQuery, useDeleteUserMutation } = userAPI;
