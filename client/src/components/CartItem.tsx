import React from "react";
import { FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";

type CartItemsProps = {
  cartItem: any;
};

const CartItem = ({ cartItem }: CartItemsProps) => {
  const { photo, name, productId, price, quantity } = cartItem;
  return (
    <div className="cart-item">
      <img src={photo} alt={name} />
      <article>
        <NavLink to={`/product/${productId}`}>{name}</NavLink>
        <span>₹{price}</span>
      </article>
      <div>
        <button>-</button>
        <p>{quantity}</p>
        <button>+</button>
      </div>
      <button>
        <FaTrash />
      </button>
    </div>
  );
};

export default CartItem;
