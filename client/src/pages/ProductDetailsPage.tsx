import { CarouselButtonType, MyntraCarousel, Slider, useRating } from "6pp";
import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { TfiWrite } from "react-icons/tfi";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import { SkeletonLoader } from "../components/Loader";
import RatingsComponent from "../components/Ratings";
import {
  useAllReviewsQuery,
  useNewReviewMutation,
  useProductDetailsQuery,
} from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import type { RootState } from "../redux/store";
import type { CartItem, Review } from "../types/types";

const ProductDetailsPage = () => {
  const { id = "" } = useParams();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, isError, data } = useProductDetailsQuery(id, {
    skip: !id,
  });

  const reviewsResponse = useAllReviewsQuery(id, { skip: !id });

  const [carouselOpen, setCarouselOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewComment, setReviewComment] = useState("");

  const reviewDialogRef = useRef<HTMLDialogElement>(null);

  const [createReview, { isLoading: reviewSubmitting }] =
    useNewReviewMutation();

  const {
    Ratings: RatingsEditable,
    setRating,
    rating,
  } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value: 0,
    selectable: true,
    styles: {
      fontSize: "1.5rem",
      color: "coral",
      justifyContent: "flex-start",
    },
  });

  const product = data?.product;
  const productImages = product?.photos?.map((photo) => photo.url) ?? [];
  const reviews = reviewsResponse.data?.productReviews ?? [];

  const decrement = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increment = () => {
    if (!product) return;

    setQuantity((previous) => {
      if (previous >= product.stock) {
        toast.error(`${product.stock} available only`);
        return previous;
      }

      return previous + 1;
    });
  };

  const addToCartHandler = () => {
    if (!product) return;

    if (product.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} available`);
      return;
    }

    const cartItem: CartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      photo: product.photos?.[0]?.url ?? "",
      quantity,
    };

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  const showDialog = () => {
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }

    reviewDialogRef.current?.showModal();
  };

  const reviewCloseHandler = () => {
    reviewDialogRef.current?.close();
    setRating(0);
    setReviewComment("");
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !id) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please enter your review");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const response = await createReview({
        comment: reviewComment.trim(),
        rating,
        userId: user._id,
        productId: id,
      }).unwrap();

      toast.success(response.message || "Review submitted successfully");
      reviewCloseHandler();
    } catch {
      toast.error("Unable to submit your review. Please try again.");
    }
  };

  if (!id || isError || (!isLoading && !product)) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="product-details">
      {isLoading ? (
        <ProductLoader />
      ) : product ? (
        <main className="product-details__main">
          <section className="product-details__gallery">
            {productImages.length > 0 ? (
              <>
                <Slider
                  showThumbnails
                  showNav={false}
                  onClick={() => setCarouselOpen(true)}
                  images={productImages}
                />

                {carouselOpen &&
                  createPortal(
                    <>
                      <MyntraCarousel
                        NextButton={NextButton}
                        PrevButton={PrevButton}
                        setIsOpen={setCarouselOpen}
                        images={productImages}
                        objectFit="contain"
                      />

                      <button
                        type="button"
                        className="product-details__zoom-close"
                        onClick={() => setCarouselOpen(false)}
                        aria-label="Close image viewer"
                      >
                        ×
                      </button>
                    </>,
                    document.body,
                  )}
              </>
            ) : (
              <div className="product-details__image-placeholder">
                Product image unavailable
              </div>
            )}
          </section>

          <section className="product-details__info">
            <span className="product-details__category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="product-details__rating">
              <RatingsComponent value={product.ratings || 0} />
              <span>({product.numOfReviews || 0} reviews)</span>
            </div>

            <h2 className="product-details__price">
              ₹{product.price.toLocaleString("en-IN")}
            </h2>

            <p
              className={
                product.stock > 0
                  ? "product-details__stock product-details__stock--available"
                  : "product-details__stock product-details__stock--unavailable"
              }
            >
              {product.stock > 0
                ? `${product.stock} items available`
                : "Out of stock"}
            </p>

            <div className="product-details__purchase">
              <div className="product-details__quantity">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increment}
                  disabled={product.stock < 1 || quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="product-details__add-button"
                onClick={addToCartHandler}
                disabled={product.stock < 1}
              >
                Add to Cart
              </button>
            </div>

            <div className="product-details__description">
              <h2>Product Description</h2>
              <p>{product.description}</p>
            </div>
          </section>
        </main>
      ) : null}

      <dialog
        ref={reviewDialogRef}
        className="review-dialog"
        onClick={(event) => {
          if (event.target === reviewDialogRef.current) {
            reviewCloseHandler();
          }
        }}
      >
        <button
          type="button"
          className="review-dialog__close"
          onClick={reviewCloseHandler}
          aria-label="Close review dialog"
          disabled={reviewSubmitting}
        >
          ×
        </button>

        <h2>Write a Review</h2>

        <form onSubmit={submitReview}>
          <label htmlFor="review-comment">Your review</label>

          <textarea
            id="review-comment"
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            placeholder="Share your experience with this product..."
            rows={5}
            maxLength={1000}
            required
          />

          <RatingsEditable />

          <button type="submit" disabled={reviewSubmitting}>
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </dialog>

      <section className="product-details__reviews">
        <div className="product-details__reviews-heading">
          <div>
            <h2>Customer Reviews</h2>
            <p>See what customers think about this product.</p>
          </div>

          {user && !reviewsResponse.isLoading && (
            <button type="button" onClick={showDialog}>
              <TfiWrite />
              Write a Review
            </button>
          )}
        </div>

        {reviewsResponse.isLoading ? (
          <SkeletonLoader width="100%" length={3} />
        ) : reviewsResponse.isError ? (
          <p className="product-details__reviews-message">
            Unable to load reviews. Please try again later.
          </p>
        ) : reviews.length > 0 ? (
          <div className="product-details__review-list">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="product-details__reviews-message">
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience with this product.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <article className="review">
      <RatingsComponent value={review.rating} />

      <p>{review.comment}</p>

      <div className="review__user">
        <img src={review.user.photo} alt="" loading="lazy" />
        <small>{review.user.name}</small>
      </div>
    </article>
  );
};

const ProductLoader = () => {
  return (
    <div className="product-details__loader">
      <section>
        <SkeletonLoader
          width="100%"
          containerHeight="100%"
          height="100%"
          length={1}
        />
      </section>

      <section>
        <SkeletonLoader width="40%" length={3} />
        <SkeletonLoader width="50%" length={4} />
        <SkeletonLoader width="100%" length={2} />
        <SkeletonLoader width="100%" length={5} />
      </section>
    </div>
  );
};

const NextButton: CarouselButtonType = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="carousel-btn"
    aria-label="Next image"
  >
    <FaArrowRightLong />
  </button>
);

const PrevButton: CarouselButtonType = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="carousel-btn"
    aria-label="Previous image"
  >
    <FaArrowLeftLong />
  </button>
);

export default ProductDetailsPage;
