import { useEffect, useState } from "react";
import client from "../api/client";

const STATUS_LABELS = {
  pending: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
};

const NEXT_STATUS = {
  pending: "shipped",
  shipped: "delivered",
};

export default function SellerSales() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await client.get("/seller/order-items/");
    setItems(data.results);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (item) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    const { data } = await client.patch(`/seller/order-items/${item.id}/`, { status: next });
    setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
  };

  if (loading) return <main className="container"><p className="empty-state">Загрузка...</p></main>;

  return (
    <main className="container seller-page">
      <h1>Мои продажи</h1>

      {items.length === 0 && <p className="empty-state">Продаж пока нет</p>}

      <div className="sales-list">
        {items.map((item) => (
          <div key={item.id} className="sales-row card">
            <span className="cart-item-title">{item.title}</span>
            <span className="cart-item-meta">× {item.quantity}</span>
            <span className="cart-item-subtotal">
              {Number(item.subtotal).toLocaleString("ru-RU")} ₽
            </span>
            <span className="badge badge-pink">{STATUS_LABELS[item.status]}</span>
            {NEXT_STATUS[item.status] && (
              <button className="btn btn-outline btn-sm" onClick={() => advance(item)}>
                Пометить «{STATUS_LABELS[NEXT_STATUS[item.status]]}»
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
