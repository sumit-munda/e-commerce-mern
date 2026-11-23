import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { MessageResponse } from "../types/api.types";
import { SerializedError } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";

type ResType =
  | { data: MessageResponse }
  | { error: FetchBaseQueryError | SerializedError };

const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
): string => {
  if ("status" in error) {
    if (
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
    ) {
      return error.data.message;
    }

    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const responseToast = (
  res: ResType,
  navigate?: NavigateFunction | null,
  url?: string,
) => {
  if ("data" in res) {
    toast.success(res.data.message);

    if (navigate && url) {
      navigate(url);
    }
  } else {
    toast.error(getErrorMessage(res.error));
  }
};

export const getLastMonths = () => {
  const currentDate = moment();
  currentDate.date(1);

  const last6Months: string[] = [];
  const last12Months: string[] = [];

  for (let i = 0; i < 6; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last6Months.unshift(monthName);
  }

  for (let i = 0; i < 12; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last12Months.unshift(monthName);
  }

  return {
    last6Months,
    last12Months,
  };
};

export const transformImage = (url: string, width = 300) => {
  const newUrl = url?.replace("upload/", `upload/dpr_auto/w_${width}/`);
  return newUrl;
};
