import { ReactElement, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { FaBoxOpen, FaImage, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/Loader";
import { useAllProductsQuery } from "../../redux/api/productAPI";
import { CustomError } from "../../types/api.types";
import { userReducerInitialState } from "../../types/reducer.types";

interface DataType {
  photo: ReactElement;
  name: string;
  price: number;
  stock: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Photo",
    accessor: "photo",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Price",
    accessor: "price",
  },
  {
    Header: "Stock",
    accessor: "stock",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Products = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer,
  );

  const { data, isLoading, isError, error } = useAllProductsQuery(
    user?._id ?? "",
    { skip: !user?._id },
  );

  const products = data?.adminProducts;

  useEffect(() => {
    if (isError) {
      const err = error as CustomError;
      toast.error(err.data?.message || "Unable to load products.");
    }
  }, [isError, error]);

  const rows = useMemo<DataType[]>(
    () =>
      (products ?? []).map((product) => ({
        photo: product.photos?.[0]?.url ? (
          <img src={product.photos[0].url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-table__image-placeholder">
            <FaImage />
          </div>
        ),
        name: product.name,
        price: product.price,
        stock: product.stock,
        action: (
          <NavLink
            to={`/admin/products/${product._id}`}
            className="product-table__manage"
          >
            Manage
          </NavLink>
        ),
      })),
    [products],
  );

  const Table = useMemo(
    () =>
      TableHOC<DataType>(
        columns,
        rows,
        "dashboard-product-box",
        "All Products",
        rows.length > 6,
      ),
    [rows],
  );

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="admin-products-page">
        <header className="admin-products-header">
          <div>
            <span className="admin-products-eyebrow">CATALOG MANAGEMENT</span>
            <h1>Products</h1>
            <p>Manage your store inventory and product listings.</p>
          </div>

          <div className="admin-products-header__actions">
            <span className="admin-products-count">
              {products?.length ?? 0}
              {products?.length === 1 ? " Product" : " Products"}
            </span>

            <Link to="/admin/products/new" className="create-product-btn">
              <FaPlus />
              <span>Add Product</span>
            </Link>
          </div>
        </header>

        {isLoading ? (
          <SkeletonLoader length={8} />
        ) : isError ? (
          <div className="admin-products-state">
            <FaBoxOpen />
            <h2>Couldn't load products</h2>
            <p>Please try again in a moment.</p>
          </div>
        ) : !products?.length ? (
          <div className="admin-products-state">
            <FaBoxOpen />
            <h2>No products yet</h2>
            <p>Add your first product to start building your catalog.</p>
            <Link to="/admin/products/new" className="create-product-btn">
              <FaPlus />
              <span>Add your First Product</span>
            </Link>
          </div>
        ) : (
          <Table />
        )}
      </main>
    </div>
  );
};

export default Products;
