import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    photos: [
      {
        public_id: { type: String, required: [true, "Please enter Public ID"] },
        url: { type: String, required: [true, "Please enter URL"] },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please enter price"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter description"],
    },
    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const products = mongoose.model("product", productSchema);
