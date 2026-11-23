import { FaExpandAlt, FaImage, FaPlus } from "react-icons/fa";
import { CartItem } from "../types/types";
import { Link } from "react-router-dom";
import { transformImage } from "../utils/features";
import { useState } from "react";

type ProductsProps = {
  productId: string;
  photos: { public_id: string; url: string }[];
  name: string;
  price: number;
  stock: number;
  handler: (cartItem: CartItem) => void;
};

const ProductCard = ({
  productId,
  price,
  photos,
  name,
  stock,
  handler,
}: ProductsProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  const photo = photos?.[0]?.url;

  return (
    <article className="product-card">
      {photo && !imageFailed ? (
        <img
          src={transformImage(photo, 700)}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="product-card__placeholder"
          aria-label="No product image available"
        >
          <FaImage /> <span>No image available</span>
        </div>
      )}

      <p title={name}>{name}</p>

      <span>₹{price.toLocaleString("en-IN")}</span>

      <div className="product-card__actions">
        <button
          type="button"
          aria-label={`Add ${name} to cart`}
          title="Add to cart"
          disabled={stock < 1}
          onClick={() =>
            handler({
              productId,
              price,
              name,
              photo: photo ?? "",
              stock,
              quantity: 1,
            })
          }
        >
          <FaPlus />
        </button>

        <Link
          to={`/products/${productId}`}
          aria-label={`View ${name} details`}
          title="View product"
        >
          <FaExpandAlt />
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
