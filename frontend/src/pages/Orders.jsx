import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import client from "../api/client";

const STATUS_LABELS = {
  created: { label: "Оформлен", cls: "badge-gray" },
  paid: { label: "Оплачен", cls: "badge-pink" },
  cancelled: { label: "Отменён", cls: "badge-gray" },
};

const ITEM_STATUS_LABELS = {
  pending: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const load = async () => {
    const { data } = await client.get("/orders/");
    setOrders(data.results);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pay = async (orderId) => {
    await client.post(`/orders/${orderId}/pay/`);
    load();
  };

  if (loading) return <main className="container"><p className="empty-state">Загрузка...</p></main>;

  if (orders.length === 0) {
    return (
      <main className="container">
        <div className="empty-state card" style={{ marginTop: 32 }}>
          <p>У вас пока нет заказов</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container orders-page">
      <h1>Мои заказы</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card card" data-highlight={location.state?.justCreated === order.id}>
            <div className="order-card-header">
              <span>Заказ #{order.id}</span>
              <span className={`badge ${STATUS_LABELS[order.status].cls}`}>
                {STATUS_LABELS[order.status].label}
              </span>
            </div>
            <p className="order-card-address">{order.shipping_address}</p>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item-row">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="badge badge-gray">{ITEM_STATUS_LABELS[item.status]}</span>
                  <span>{Number(item.subtotal).toLocaleString("ru-RU")} ₽</span>
                </div>
              ))}
            </div>
            <div className="order-card-footer">
              <strong>{Number(order.total_price).toLocaleString("ru-RU")} ₽</strong>
              {order.status === "created" && (
                <button className="btn btn-primary btn-sm" onClick={() => pay(order.id)}>
                  Оплатить (демо)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
