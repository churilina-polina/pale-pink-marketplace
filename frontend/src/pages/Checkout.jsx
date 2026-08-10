import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart, refresh } = useCart();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: order } = await client.post("/orders/checkout/", { shipping_address: address });
      await refresh();
      navigate("/orders", { state: { justCreated: order.id } });
    } catch (err) {
      setError(err.response?.data?.[0] || err.response?.data?.detail || "Не получилось оформить заказ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container checkout-page">
      <h1>Оформление заказа</h1>

      <div className="checkout-grid">
        <form className="card checkout-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Адрес доставки</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Город, улица, дом, квартира"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Оформляем..." : "Оформить заказ"}
          </button>
          <p className="hint-text">
            После оформления останется подтвердить оплату на странице заказов (это демо — реальное списание средств не происходит).
          </p>
        </form>

        <div className="card checkout-summary">
          <h2>Ваш заказ</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="checkout-summary-item">
              <span>{item.product.title} × {item.quantity}</span>
              <span>{Number(item.subtotal).toLocaleString("ru-RU")} ₽</span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Итого</span>
            <strong>{Number(cart.total_price).toLocaleString("ru-RU")} ₽</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
