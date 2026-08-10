import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await client.get("/seller/products/");
    setProducts(data.results);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Удалить товар?")) return;
    await client.delete(`/seller/products/${id}/`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleActive = async (product) => {
    const { data } = await client.patch(`/seller/products/${product.id}/`, {
      is_active: !product.is_active,
    });
    setProducts((prev) => prev.map((p) => (p.id === product.id ? data : p)));
  };

  return (
    <main className="container seller-page">
      <div className="section-heading">
        <h1>Мои товары</h1>
        <Link to="/seller/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
      </div>

      {loading && <p className="empty-state">Загрузка...</p>}

      {!loading && products.length === 0 && (
        <div className="empty-state card">
          <p>У вас пока нет товаров</p>
          <Link to="/seller/products/new" className="btn btn-primary">
            Добавить первый товар
          </Link>
        </div>
      )}

      <div className="seller-product-list">
        {products.map((product) => (
          <div key={product.id} className="seller-product-row card">
            <div className="seller-product-image">
              {product.image_url ? <img src={product.image_url} alt={product.title} /> : <span>👗</span>}
            </div>
            <div className="seller-product-info">
              <span className="cart-item-title">{product.title}</span>
              <span className="cart-item-meta">
                {Number(product.price).toLocaleString("ru-RU")} ₽ · остаток {product.stock}
              </span>
            </div>
            <span className={`badge ${product.is_active ? "badge-pink" : "badge-gray"}`}>
              {product.is_active ? "Активен" : "Скрыт"}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(product)}>
              {product.is_active ? "Скрыть" : "Показать"}
            </button>
            <Link to={`/seller/products/${product.id}/edit`} className="btn btn-outline btn-sm">
              Изменить
            </Link>
            <button className="cart-item-remove" onClick={() => remove(product.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
