import { useFileHandler } from "6pp";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaImage,
  FaSave,
  FaTrash,
  FaUpload
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import {
  useDeleteProductMutation,
  useProductDetailsQuery,
  useUpdateProductMutation,
} from "../../../redux/api/productAPI";
import type { userReducerInitialState } from "../../../types/reducer.types";
import { responseToast, transformImage } from "../../../utils/features";

const ProductManagement = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer,
  );

  const navigate = useNavigate()

  const { id } = useParams();

  const { data, isLoading, isError } = useProductDetailsQuery(id ?? "", {
    skip: !id,
  });

  const product = data?.product;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [nameUpdate, setNameUpdate] = useState("");
  const [descriptionUpdate, setDescriptionUpdate] = useState("");
  const [priceUpdate, setPriceUpdate] = useState(0);
  const [stockUpdate, setStockUpdate] = useState(0);
  const [categoryUpdate, setCategoryUpdate] = useState("");

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const photosFiles = useFileHandler("multiple", 10, 5);

  useEffect(() => {
    if (product) {
      setNameUpdate(product.name);
      setDescriptionUpdate(product.description);
      setPriceUpdate(product.price);
      setStockUpdate(product.stock);
      setCategoryUpdate(product.category);
    }
  }, [product]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!user?._id || !product?._id) {
      toast.error("Unable to identify the product or administrator.");
      return;
    }

    if (
      !nameUpdate.trim() ||
      !descriptionUpdate.trim() ||
      !categoryUpdate.trim()
    ) {
      toast.error("Please complete all product details.");
      return;
    }

    if (!Number.isFinite(priceUpdate) || priceUpdate <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(stockUpdate) || stockUpdate < 0) {
      toast.error("Stock must be a non-negative whole number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.set("name", nameUpdate.trim());
      formData.set("description", descriptionUpdate.trim());
      formData.set("price", priceUpdate.toString());
      formData.set("stock", stockUpdate.toString());
      formData.set("category", categoryUpdate.trim());

      photosFiles.file?.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await updateProduct({
        formData,
        userId: user._id,
        productId: product._id,
      });

      responseToast(res, navigate, "/admin/products");
    } catch {
      toast.error("Unable to update the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteHandler = async () => {
    if (isDeleting || !user?._id || !product?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await deleteProduct({
        userId: user._id,
        productId: product._id,
      });

      responseToast(res, navigate, "/admin/products");
    } catch {
      toast.error("Unable to delete the product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isError || (!isLoading && !product)) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="product-form-page product-edit-page">
        {isLoading || !product ? (
          <SkeletonLoader length={12} />
        ) : (
          <>
            <header className="product-form-header">
              <span className="product-form-eyebrow">CATALOG MANAGEMENT</span>

              <h1>Edit Product</h1>

              <p>
                Review your product information, update its details, or manage
                its images.
              </p>
            </header>

            <section className="product-form-card product-edit-card">
              <div className="product-edit-summary">
                <div className="product-edit-summary__image">
                  {product.photos?.[0]?.url ? (
                    <img
                      src={transformImage(product.photos[0].url)}
                      alt={product.name}
                    />
                  ) : (
                    <FaImage />
                  )}
                </div>

                <div className="product-edit-summary__details">
                  <span>PRODUCT OVERVIEW</span>
                  <h2>{product.name}</h2>
                  <p>₹{product.price.toLocaleString("en-IN")}</p>
                  <span
                    className={
                      product.stock > 0
                        ? "product-stock is-available"
                        : "product-stock is-unavailable"
                    }
                  >
                    {product.stock > 0
                      ? `${product.stock} units available`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="product-edit-id">
                <span>Product ID</span>
                <code>{product._id}</code>
              </div>

              <form onSubmit={submitHandler}>
                <div className="product-form-section">
                  <div className="product-form-section__heading">
                    <div>
                      <h2>Product Information</h2>
                      <p>Update the details of this product.</p>
                    </div>
                    <span>01</span>
                  </div>

                  <div className="product-form-field">
                    <label htmlFor="edit-product-name">Product Name</label>
                    <input
                      id="edit-product-name"
                      type="text"
                      value={nameUpdate}
                      onChange={(e) => setNameUpdate(e.target.value)}
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="product-form-field">
                    <label htmlFor="edit-product-description">
                      Description
                    </label>
                    <textarea
                      id="edit-product-description"
                      value={descriptionUpdate}
                      onChange={(e) => setDescriptionUpdate(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="product-form-grid">
                    <div className="product-form-field">
                      <label htmlFor="edit-product-price">Price (₹)</label>
                      <input
                        id="edit-product-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={priceUpdate}
                        onChange={(e) => setPriceUpdate(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="product-form-field">
                      <label htmlFor="edit-product-stock">
                        Available Stock
                      </label>
                      <input
                        id="edit-product-stock"
                        type="number"
                        min="0"
                        step="1"
                        value={stockUpdate}
                        onChange={(e) => setStockUpdate(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="product-form-field">
                    <label htmlFor="edit-product-category">Category</label>
                    <input
                      id="edit-product-category"
                      type="text"
                      value={categoryUpdate}
                      onChange={(e) => setCategoryUpdate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="product-form-section">
                  <div className="product-form-section__heading">
                    <div>
                      <h2>Product Images</h2>
                      <p>
                        Select replacement or additional images for this
                        product.
                      </p>
                    </div>
                    <span>02</span>
                  </div>

                  {product.photos?.length > 0 && (
                    <div className="product-preview-section">
                      <div className="product-preview-heading">
                        <h3>Current Images</h3>
                        <span>{product.photos.length} images</span>
                      </div>

                      <div className="product-image-previews">
                        {product.photos.map((photo, index) => (
                          <div
                            className="product-image-preview"
                            key={photo.public_id || index}
                          >
                            <img
                              src={transformImage(photo.url)}
                              alt={`${product.name} image ${index + 1}`}
                            />
                            {index === 0 && (
                              <span className="product-image-primary">
                                Main image
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <label
                    className="product-upload-area"
                    htmlFor="edit-product-photos"
                  >
                    <span className="product-upload-icon">
                      <FaUpload />
                    </span>
                    <strong>Choose new product images</strong>
                    <span>Click here to browse your files</span>
                    <small>Up to 10 images · Maximum 5 MB per image</small>

                    <input
                      id="edit-product-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={photosFiles.changeHandler}
                    />
                  </label>

                  {photosFiles.error && (
                    <p className="product-upload-error" role="alert">
                      {photosFiles.error}
                    </p>
                  )}

                  {photosFiles.preview && photosFiles.preview.length > 0 && (
                    <div className="product-preview-section">
                      <div className="product-preview-heading">
                        <h3>Selected Images</h3>
                        <span>{photosFiles.preview.length} selected</span>
                      </div>

                      <div className="product-image-previews">
                        {photosFiles.preview.map((img, index) => (
                          <div className="product-image-preview" key={index}>
                            <img
                              src={img}
                              alt={`New product image ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="product-form-actions">
                  <button type="submit" disabled={isSubmitting || isDeleting}>
                    <FaSave />
                    {isSubmitting ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>

              <div className="product-edit-danger">
                <div>
                  <h3>Delete this product</h3>
                  <p>Permanently remove this product from your store.</p>
                </div>

                <button
                  type="button"
                  onClick={deleteHandler}
                  disabled={isDeleting || isSubmitting}
                >
                  <FaTrash />
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;
