import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Products.css";

const PRODUCT_API = "http://localhost:8080/api/products";
const UPLOAD_API = "http://localhost:8080/api/upload";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    imageUrl: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await axios.get(PRODUCT_API);
    setProducts(res.data || []);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);

    try {
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm(prev => ({
        ...prev,
        imageUrl: res.data.imageUrl
      }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await axios.put(`${PRODUCT_API}/${editing.id}`, form);
      } else {
        await axios.post(PRODUCT_API, form);
      }

      setShowModal(false);
      setEditing(null);

      setForm({
        name: "",
        category: "",
        price: "",
        quantity: "",
        imageUrl: ""
      });

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
      imageUrl: product.imageUrl || ""
    });
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await axios.delete(`${PRODUCT_API}/${id}`);
    loadProducts();
  };

  return (
    <>
      <Sidebar />

      <div className="page-content">
        <div className="products-page">
          <h1>Products</h1>
          <p>Manage all shop products.</p>

          <button
            className="add-btn"
            onClick={() => {
              setEditing(null);
              setForm({
                name: "",
                category: "",
                price: "",
                quantity: "",
                imageUrl: ""
              });
              setShowModal(true);
            }}
          >
            + Add Product
          </button>

          <div className="products-card">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>

                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>{product.quantity}</td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => editProduct(product)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h2>{editing ? "Edit Product" : "Add Product"}</h2>

                <form onSubmit={saveProduct}>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        category: e.target.value
                      }))
                    }
                    required
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        price: e.target.value
                      }))
                    }
                    required
                  />

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        quantity: e.target.value
                      }))
                    }
                    required
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                  />

                  {uploading && <p>Uploading to AWS S3...</p>}

                  {form.imageUrl && (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginTop: "10px"
                      }}
                    />
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-btn"
                      disabled={uploading}
                    >
                      {editing ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}