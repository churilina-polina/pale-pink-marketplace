import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <main className="container">
        <div className="empty-state card" style={{ marginTop: 32 }}>
          <p>Корзина пуста</p>
          <Link to="/" className="btn btn-primary">
            В каталог
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container cart-page">
      <h1>Корзина</h1>

      <div className="cart-list">
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item card">
            <div className="cart-item-image">
              {item.product.image_url ? (
                <img src={item.product.image_url} alt={item.product.title} />
              ) : (
                <span>👗</span>
              )}
            </div>
            <div className="cart-item-info">
              <Link to={`/products/${item.product.id}`} className="cart-item-title">
                {item.product.title}
              </Link>
              <span className="cart-item-meta">
                {item.product.size !== "ONE" && `Размер ${item.product.size} · `}
                {Number(item.product.price).toLocaleString("ru-RU")} ₽
              </span>
            </div>
            <div className="quantity-picker">
              <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
            </div>
            <span className="cart-item-subtotal">
              {Number(item.subtotal).toLocaleString("ru-RU")} ₽
            </span>
            <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary card">
        <span>Итого</span>
        <strong>{Number(cart.total_price).toLocaleString("ru-RU")} ₽</strong>
        <button className="btn btn-primary" onClick={() => navigate("/checkout")}>
          Оформить заказ
        </button>
      </div>
    </main>
  );
}
