import { FaImage, FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import type { CartItem } from "../types/types";
import { transformImage } from "../utils/features";
import { useState } from "react";

type CartItemsProps = {
  cartItem: CartItem;
  incrementHandler: (cartItem: CartItem) => void;
  decrementHandler: (cartItem: CartItem) => void;
  removeHandler: (id: string) => void;
};

const CartItemCard = ({
  cartItem,
  incrementHandler,
  decrementHandler,
  removeHandler,
}: CartItemsProps) => {
  const { photo, name, productId, price, quantity, stock } = cartItem;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="cart-item">
      <NavLink
        to={`/products/${productId}`}
        className="cart-item__image"
        aria-label={`View ${name}`}
      >
        {photo && !imageFailed ? (
          <img
            src={transformImage(photo)}
            alt={name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="cart-item__image-placeholder">
            <FaImage />
            <span>No image</span>
          </div>
        )}
      </NavLink>

      <div className="cart-item__details">
        <NavLink to={`/products/${productId}`}>{name}</NavLink>

        <span>₹{price.toLocaleString("en-IN")}</span>
      </div>

      <div className="cart-item__quantity">
        <button
          type="button"
          onClick={() => decrementHandler(cartItem)}
          disabled={quantity <= 1}
          aria-label={`Decrease quantity of ${name}`}
        >
          -
        </button>

        <span aria-live="polite">{quantity}</span>

        <button
          type="button"
          onClick={() => incrementHandler(cartItem)}
          disabled={quantity >= stock}
          aria-label={`Increase quantity of ${name}`}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="cart-item__remove"
        onClick={() => removeHandler(productId)}
        aria-label={`Remove ${name} from cart`}
        title="Remove item"
      >
        <FaTrash />
      </button>
    </article>
  );
};

export default CartItemCard;
