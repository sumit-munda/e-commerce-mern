import { useFileHandler } from "6pp";
import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaImage, FaPlus, FaUpload } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useNewProductMutation } from "../../../redux/api/productAPI";
import type { userReducerInitialState } from "../../../types/reducer.types";
import { responseToast } from "../../../utils/features";

const NewProduct = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(1000);
  const [stock, setStock] = useState(1);
  const [description, setDescription] = useState("");

  const [newProduct] = useNewProductMutation();
  const navigate = useNavigate();
  const photos = useFileHandler("multiple", 10, 5);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!user?._id) {
      toast.error("Please sign in before creating a product.");
      return;
    }

    if (!name.trim() || !category.trim() || !description.trim()) {
      toast.error("Please complete all product details.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative whole number.");
      return;
    }

    if (!photos.file || photos.file.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.set("name", name.trim());
      formData.set("description", description.trim());
      formData.set("price", price.toString());
      formData.set("stock", stock.toString());
      formData.set("category", category.trim());

      photos.file.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await newProduct({
        id: user._id,
        formData,
      });

      responseToast(res, navigate, "/admin/products");
    } catch {
      toast.error("Unable to create the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="product-form-page">
        <header className="product-form-header">
          <span className="product-form-eyebrow">CATALOG MANAGEMENT</span>
          <h1>Add New Product</h1>
          <p>
            Add a product to your store by providing its details and images.
          </p>
        </header>

        <section className="product-form-card">
          <form onSubmit={submitHandler}>
            <div className="product-form-section">
              <div className="product-form-section__heading">
                <div>
                  <h2>Product Information</h2>
                  <p>Enter the basic details of your product.</p>
                </div>
                <span>01</span>
              </div>

              <div className="product-form-field">
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>

              <div className="product-form-field">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  placeholder="Describe the product, its features and specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="product-form-grid">
                <div className="product-form-field">
                  <label htmlFor="product-price">Price (₹)</label>
                  <input
                    id="product-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-stock">Available Stock</label>
                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="product-form-field">
                <label htmlFor="product-category">Category</label>
                <input
                  id="product-category"
                  type="text"
                  placeholder="e.g. laptop, camera, accessories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="product-form-section">
              <div className="product-form-section__heading">
                <div>
                  <h2>Product Images</h2>
                  <p>Upload clear images to showcase your product.</p>
                </div>
                <span>02</span>
              </div>

              <label className="product-upload-area" htmlFor="product-photos">
                <span className="product-upload-icon">
                  <FaUpload />
                </span>
                <strong>Choose product images</strong>
                <span>Click here to browse your files</span>
                <small>Up to 10 images · Maximum 5 MB per image</small>

                <input
                  id="product-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={photos.changeHandler}
                />
              </label>

              {photos.error && (
                <p className="product-upload-error" role="alert">
                  {photos.error}
                </p>
              )}

              {photos.preview && photos.preview.length > 0 && (
                <div className="product-preview-section">
                  <div className="product-preview-heading">
                    <h3>Image Previews</h3>
                    <span>{photos.preview.length} selected</span>
                  </div>

                  <div className="product-image-previews">
                    {photos.preview.map((img, index) => (
                      <div className="product-image-preview" key={index}>
                        <img src={img} alt={`Product preview ${index + 1}`} />
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

              {(!photos.preview || photos.preview.length === 0) && (
                <div className="product-upload-empty">
                  <FaImage />
                  <span>Your image previews will appear here.</span>
                </div>
              )}
            </div>

            <div className="product-form-actions">
              <Link to="/admin/products" className="product-form-cancel">
                Cancel
              </Link>

              <button type="submit" disabled={isSubmitting}>
                <FaPlus />
                {isSubmitting ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default NewProduct;
