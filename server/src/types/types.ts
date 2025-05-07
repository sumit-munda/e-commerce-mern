import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export interface PostUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  role: string;
  _id: string;
  dob: Date;
}

export interface Photo {
  public_id: string;
  url: string;
}

export interface PostProductRequestBody extends Document {
  name: string;
  photos: Types.DocumentArray<Photo>;
  price: number;
  stock: number;
  category: string;
  description: string;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $lte: number;
  };
  category?: string;
}

export type InvalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  review?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};

export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: number;
  pinCode: number;
};

export interface PostOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}
