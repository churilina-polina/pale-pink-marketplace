import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { value: "", label: "Все категории" },
  { value: "tops", label: "Футболки и топы" },
  { value: "dresses", label: "Платья" },
  { value: "outerwear", label: "Верхняя одежда" },
  { value: "bottoms", label: "Брюки и джинсы" },
  { value: "shoes", label: "Обувь" },
  { value: "accessories", label: "Аксессуары" },
];

const SIZES = ["", "XS", "S", "M", "L", "XL", "ONE"];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", size: "", search: "", ordering: "" });
  const { isAuthenticated, isSeller } = useAuth();

  const load = async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await client.get("/products/", { params });
    setProducts(data.results);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) return;
    if (product.is_wishlisted) {
      await client.delete(`/wishlist/by-product/${product.id}/`);
    } else {
      await client.post("/wishlist/", { product_id: product.id });
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_wishlisted: !p.is_wishlisted } : p))
    );
  };

  return (
    <main className="container catalog-page">
      <section className="catalog-hero">
        <h1>Одежда, которую хочется носить</h1>
        <p>Каталог от независимых продавцов — платья, верхняя одежда, обувь и аксессуары</p>
      </section>

      <div className="filter-bar card">
        <input
          className="input"
          placeholder="Поиск по названию..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.size}
          onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}
        >
          <option value="">Все размеры</option>
          {SIZES.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s === "ONE" ? "Один размер" : s}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.ordering}
          onChange={(e) => setFilters((f) => ({ ...f, ordering: e.target.value }))}
        >
          <option value="">По новизне</option>
          <option value="price">Сначала дешевле</option>
          <option value="-price">Сначала дороже</option>
        </select>
      </div>

      {loading && <p className="empty-state">Загрузка...</p>}

      {!loading && products.length === 0 && (
        <p className="empty-state">Ничего не найдено. Попробуй изменить фильтры.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onToggleWishlist={toggleWishlist}
            showWishlist={isAuthenticated && !isSeller}
          />
        ))}
      </div>
    </main>
  );
}
