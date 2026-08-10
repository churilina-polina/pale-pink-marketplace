import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

const CATEGORIES = [
  { value: "tops", label: "Футболки и топы" },
  { value: "dresses", label: "Платья" },
  { value: "outerwear", label: "Верхняя одежда" },
  { value: "bottoms", label: "Брюки и джинсы" },
  { value: "shoes", label: "Обувь" },
  { value: "accessories", label: "Аксессуары" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "ONE"];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "tops",
  size: "M",
  color: "",
  price: "",
  stock: 1,
  image_url: "",
};

export default function SellerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      client.get(`/seller/products/${id}/`).then(({ data }) => setForm(data));
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await client.patch(`/seller/products/${id}/`, form);
      } else {
        await client.post("/seller/products/", form);
      }
      navigate("/seller");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Не удалось сохранить товар");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container seller-page">
      <h1>{isEdit ? "Редактировать товар" : "Новый товар"}</h1>

      <form className="card product-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Название</label>
          <input className="input" value={form.title} onChange={handleChange("title")} required />
        </div>

        <div className="field">
          <label>Описание</label>
          <textarea className="input" rows={3} value={form.description} onChange={handleChange("description")} />
        </div>

        <div className="product-form-row">
          <div className="field">
            <label>Категория</label>
            <select className="input" value={form.category} onChange={handleChange("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Размер</label>
            <select className="input" value={form.size} onChange={handleChange("size")}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s === "ONE" ? "Один размер" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="product-form-row">
          <div className="field">
            <label>Цвет</label>
            <input className="input" value={form.color} onChange={handleChange("color")} placeholder="чёрный" />
          </div>
          <div className="field">
            <label>Цена, ₽</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange("price")}
              required
            />
          </div>
        </div>

        <div className="product-form-row">
          <div className="field">
            <label>Остаток на складе</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange("stock")}
              required
            />
          </div>
          <div className="field">
            <label>Ссылка на изображение</label>
            <input
              className="input"
              value={form.image_url}
              onChange={handleChange("image_url")}
              placeholder="https://..."
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="product-form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/seller")}>
            Отмена
          </button>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </form>
    </main>
  );
}
