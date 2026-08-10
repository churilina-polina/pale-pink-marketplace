import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import client from "../api/client";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await client.get("/wishlist/");
    setItems(data.results);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleWishlist = async (product) => {
    await client.delete(`/wishlist/by-product/${product.id}/`);
    setItems((prev) => prev.filter((item) => item.product.id !== product.id));
  };

  if (loading) return <main className="container"><p className="empty-state">Загрузка...</p></main>;

  return (
    <main className="container catalog-page">
      <h1>Избранное</h1>

      {items.length === 0 && <p className="empty-state">В избранном пока пусто</p>}

      <div className="product-grid">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            product={{ ...item.product, is_wishlisted: true }}
            onToggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </main>
  );
}
