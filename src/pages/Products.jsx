import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Products.css";
import "./shared.css";

const PRODUCT_API = "/products";
const UPLOAD_API = "/upload";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  quantity: "",
  imageUrl: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await api.get(PRODUCT_API);
    setProducts(res.data || []);
  }

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);

    try {
      const res = await api.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl,
      }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`${PRODUCT_API}/${editing.id}`, form);
      } else {
        await api.post(PRODUCT_API, form);
      }

      setShowModal(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  const editProduct = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl || "",
    });
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await api.delete(`${PRODUCT_API}/${id}`);
    loadProducts();
  };

  return (
    <>
      <Sidebar />

      <div className="page-shell">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">🗂️ Inventory</span>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">
              Manage products, prices and stock levels.
            </p>
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Add Product
          </button>
        </div>

        <div className="tbl-card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      📦 No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="product-image"
                            />
                          ) : (
                            <div className="no-image">No</div>
                          )}
                          <div>
                            <strong>{product.name}</strong>
                            <small className="product-id">
                              ID: {product.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>
                        <span
                          className={
                            product.quantity > 0
                              ? "stock-pill"
                              : "stock-pill low"
                          }
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-soft"
                          onClick={() => editProduct(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            <p className="modal-hint">
              {editing
                ? "Update the product details below."
                : "Fill in the details for the new product."}
            </p>

            <form onSubmit={saveProduct}>
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Parle-G Biscuits"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />

              <label>Category</label>
              <input
                type="text"
                placeholder="e.g. Grocery"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                required
              />

              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25.00"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />

              <label>Quantity</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 100"
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />

              <label>Product Image</label>
              <input type="file" accept="image/*" onChange={uploadImage} />

              {uploading && <p className="upload-hint">Uploading image...</p>}

              {form.imageUrl && !uploading && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="thumb-preview"
                />
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {editing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}